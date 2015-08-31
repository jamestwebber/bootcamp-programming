import os
import cStringIO

from flask import g, render_template, redirect, url_for, flash

from . import app

import easier_stuff as es
import harder_stuff as hs

import numpy as np


@app.route('/')
def homepage():
    exp_data = es.experiment()

    if exp_data is not None:
        exps = np.random.randint(0, len(exp_data), size=10)
    else:
        exps = []

    return render_template("index.html", experiments=exps)


@app.route('/gene/<gene>')
def gene_info(gene):
    gene_name = es.gene_name(gene)
    gene_info = es.gene_info(gene)
    if gene_name is None or gene_info is None:
        if gene_name is None:
            flash("You need to implement <code>gene_name()</code>")
        if gene_info is None:
            flash("You need to implement <code>gene_info()</code>")
        return redirect(url_for('homepage'))

    go_terms = es.gene_to_go(gene)
    go_terms = [(goid, es.go_info(goid)) for goid in go_terms]
    gene_data = es.gene_data(gene)
    if gene_data is None:
        flash("You need to implement <code>gene_data()</code>")
        hist_data = None
    else:
        gene_hist,bins = np.histogram(gene_data, bins=np.linspace(-8, 8, 33))
        hist_data = zip(bins[:-1], gene_hist)

    return render_template("gene.html", gene_name=gene_name,
                           gene_info=gene_info, go_terms=go_terms,
                           hist_data=hist_data)


@app.route('/goid/<goid>')
def go_term_info(goid):
    go_info = es.go_info(goid)
    genes = es.go_to_gene(goid)
    if go_info is None or genes is None:
        if go_info is None:
            flash("You need to implement <code>go_info()</code>")
        if genes is None:
            flash("You need to implement <code>go_to_gene()</code>")
        return redirect(url_for('homepage'))

    genes = [(gene, es.gene_name(gene)) for gene in es.go_to_gene(goid)]

    return render_template("go_term.html", go_info=go_info, genes=genes)


@app.route('/experiment/<int:exp>')
def experiment(exp):
    exp_data = es.experiment()
    if exp_data is not None:
        genes = [(es.gene_name(g) or 'Implement gene_name()!', v)
                 for g,v in exp_data[exp]]
        fig_dict = hs.plot_experiment(genes)
    else:
        fig_dict = None

    return render_template("experiment.html", exp=exp, fig_dict=fig_dict)


@app.route('/experiment/<int:exp>/<top_or_bottom>')
@app.route('/experiment/<int:exp>/<top_or_bottom>/<int:n>')
def gene_list(exp, top_or_bottom, n=10):
    exp_data = es.experiment()
    if exp_data is not None:
        exp_data = exp_data[exp]
    else:
        flash("You need to implement <code>experiment()</code> first!")
        return redirect(url_for('experiment', exp=exp))

    if top_or_bottom == 'top':
        genes = sorted(exp_data, key=lambda g: g[1], reverse=True)[:n]
    elif top_or_bottom == 'bottom':
        genes = sorted(exp_data, key=lambda g: g[1])[:n]
    else:
        flash("That's not a valid URL")
        return redirect(url_for('experiment', exp=exp))

    return render_template("gene_list.html", label=top_or_bottom, n=n, exp=exp,
                           genes=[(g, es.gene_name(g), v) for g,v in genes])


@app.route('/experiment/<int:exp>/enrichment/<aspect>')
@app.route('/experiment/<int:exp>/enrichment/<aspect>/<int:n>')
def enrichment(exp, aspect, n=100):
    aspect = set(aspect)

    if not aspect.intersection('CFP'):
        flash("That's not a valid aspect, try C, F, and/or P")
        return redirect(url_for('experiment', exp=exp))

    exp_data = es.experiment()

    if exp_data is not None:
        exp_data = exp_data[exp]
    else:
        flash("You need to implement <code>experiment()</code> first!")
        return redirect(url_for('experiment', exp=exp))

    go_list = list(reduce(set.union, (es.go_aspect(a) for a in aspect), set()))
    go_info = {goid:es.go_info(goid) for goid in go_list}
    go_dict = {gene:es.go_to_gene(gene) for gene in go_list}

    scores = hs.calculate_enrichment(exp_data, go_dict, n)

    return render_template("enrichment.html", exp=exp, go_info=go_info,
                           e_scores=scores[0][:10], ne_scores=scores[1][:10])
