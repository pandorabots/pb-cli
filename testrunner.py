import argparse
import os

font_style = {
    'blue': '\033[94m',
    'green': '\033[92m',
    'yellow': '\033[93m',
    'red': '\033[91m',
    'end': '\033[0m',
    'bold': '\033[1m',
    'underline': '\033[4m'
}
parser = argparse.ArgumentParser(description='Run tests with options.')
parser.add_argument('-e', '--environment', default="production", help="Accepted values for ui tests are:\nmk, ac, acul, development, staging, production\nAccepted values for api tests are:\naiaas, aiaasst, production, staging, pgtst")
parser.add_argument('-f', '--file', help='Specify a filename to run a single test file.')
args = parser.parse_args()

os.putenv('test_env', args.environment)

def run_api_tests():
    if(args.file):
        os.system("python -m unittest discover -s test -p " + args.file)
    else:
        os.system("python -m unittest discover -s test -p test_*.py")

run_api_tests()
