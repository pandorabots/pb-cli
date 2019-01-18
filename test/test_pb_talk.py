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

class TestPBTalk(unittest.TestCase):
    @classmethod
    def setUpClass(self):
	self.util = util.TestUtil()
	self.util.announce_test_block('pb talk')
	self.hostname = config["hostname"]
	print self.hostname

    def test_talk_to_bot(self):
        self.util.create_and_compile()
        self.util.it('responds correctly to user input.')
        result = subprocess.Popen([
                cli, 'talk',
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

    def test_trace_flag(self):
        self.util.create_and_compile()
        self.util.it('prints trace data when --trace is specified.')
        result = subprocess.Popen([
                cli, 'talk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'xtest', '--trace'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        response = ''
        for line in result.stdout:
            response += line.rstrip('\n')

        response = json.loads(response)

        self.assertTrue("xtest" in response['trace'][1]['matched'])

    def test_extra_flag(self):
        self.util.create_and_compile()
        self.util.it('prints extra data when --extra is specified.')
        result = subprocess.Popen([
                cli, 'talk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'xtest', '--extra'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        response = ''
        for line in result.stdout:
            response += line.rstrip('\n')

        response = json.loads(response)

        self.assertTrue("xtest" in response['patterns'])

    def test_recent_flag(self):
        self.util.create_and_compile()
        self.util.it('uses the most recently compiled version of an uncompiled bot if --recent is specified.')
        self.util.upload_file('invalid.aiml')

        result = subprocess.Popen([
                cli, 'talk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        response = ''
        for line in result.stdout:
            response += line.rstrip('\n')

        self.assertTrue('412' in response)

        result = subprocess.Popen([
                cli, 'talk',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'xtest', '--recent'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        response = ''
        for line in result.stdout:
            response += line.rstrip('\n')

        self.assertEqual('Yay! This is the expected test response.', response)

    def test_not_compiled(self):
        self.util.create_bot()
        self.util.it('returns 412 if the bot is not compiled.')

        result = subprocess.Popen([
                cli, 'talk',
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
                cli, 'talk',
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
                cli, 'talk',
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
                cli, 'talk',
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
                cli, 'talk',
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
