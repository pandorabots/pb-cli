import unittest
import subprocess
import json
import os
import util
import time
from TestConfig import *
config = {}
test_env = os.getenv('test_env', 'aiaas')
env_setup = TestConfig()
config = env_setup.setEnvironment(test_env)

cli = os.path.abspath('./pb-cli/index.js')

class TestPBAtalk(unittest.TestCase):
    @classmethod
    def setUpClass(self):
	self.util = util.TestUtil()
        self.util.announce_test_block('pb atalk')
        self.hostname = config["hostname"]
	print self.hostname


    def test_atalk_to_bot(self):
        self.util.create_and_compile()
        self.util.it(['responds correctly to user input', 'returns a new client_name for bot interactions.'])
        result = subprocess.Popen([
                cli, 'atalk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        bot_response = []
        for line in result.stdout:
            bot_response.append(line.rstrip('\n'))

        self.assertTrue('Yay! This is the expected test response.' in bot_response)
        self.assertTrue('atalk: client_name was set' in bot_response[0])

    def test_preserves_predicates(self):
        self.util.create_and_compile()
        self.util.it('stores predicates for the client_name.')
	result = subprocess.Popen([
                cli, 'atalk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'xfruit apple'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        bot_response = []
        for line in result.stdout:
            bot_response.append(line.rstrip('\n'))

        client_name = bot_response[0].split(' ')
        client_name = client_name[len(client_name)-1]

        result = subprocess.Popen([
                cli, 'talk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--client_name', client_name,
                '--hostname', self.hostname,
                'get xfruit'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertEqual("The stored 'fruit' predicate is apple.\n", result.stdout.read())

    def test_reset_flag(self):
        self.util.create_and_compile()
        self.util.it('forgets predicates for the client_name when --reset is set.')
        result = subprocess.Popen([
                cli, 'atalk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'xfruit apple'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        bot_response = []
        for line in result.stdout:
            bot_response.append(line.rstrip('\n'))

        client_name = bot_response[0].split(' ')
        client_name = client_name[len(client_name)-1]

        result = subprocess.Popen([
                cli, 'talk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--client_name', client_name,
                '--hostname', self.hostname,
                'get xfruit', '--reset'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertEqual("The stored 'fruit' predicate is unknown.\n", result.stdout.read())

    def test_not_compiled(self):
        self.util.create_bot()
        self.util.it('returns 412 if the bot is not compiled.')

        result = subprocess.Popen([
                cli, 'atalk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('412' in result.stdout.read())

    def test_bad_userKey(self):
        self.util.create_and_compile()
        self.util.it('returns 401 if the user_key is invalid.')

        result = subprocess.Popen([
                cli, 'atalk',
                '--app_id', config['appId'],
                '--user_key', '12345',
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def test_bad_appId(self):
        self.util.create_and_compile()
        self.util.it('returns 412 if the app_id is missing or invalid.')

        result = subprocess.Popen([
                cli, 'atalk',
                '--app_id', '12345',
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('412' in result.stdout.read())

    def test_bad_botName(self):
        self.util.create_and_compile()
        self.util.it('returns 412 if the bot does not exist.')

        result = subprocess.Popen([
                cli, 'atalk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', '12345',
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('412' in result.stdout.read())

    def test_invalid_botName(self):
        self.util.create_and_compile()
        self.util.it('returns 400 if the botname is invalid.')

        result = subprocess.Popen([
                cli, 'atalk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', 'ABCDEFG',
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('400' in result.stdout.read())

    def tearDown(self):
        self.util.delete_bot()

if __name__ == "__main__":
    unittest.main()
