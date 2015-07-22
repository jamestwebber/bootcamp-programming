import argparse

from bootcamp import app

parser = argparse.ArgumentParser()

parser.add_argument('--external', action='store_true')
parser.add_argument('--debug', action='store_true')
parser.add_argument('--port', type=int, default=None)

args = parser.parse_args()

app.run(host=('0.0.0.0' if args.external else None),
        debug=args.debug,
        port=args.port)
