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

class TestPBCompile(unittest.TestCase):
    @classmethod
    def setUpClass(self):
	self.util = util.TestUtil()
	self.util.announce_test_block('pb compile')
	self.hostname = config["hostname"]
	print self.hostname

    def setUp(self):
        self.util.create_bot()

    def test_compile_bot(self):
        self.util.it(['successfully compiles a bot.'])
        self.util.get_ready_to_compile()
        result = subprocess.Popen([
            cli, 'compile',
            '--app_id', config['appId'],
            '--user_key', config['userKey'],
            '--botname', config['botName'],
            '--hostname', self.hostname
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        console_output = []
        for line in result.stdout:
            console_output.append(line.rstrip('\n'))

        self.assertTrue('ok' in console_output)

    def test_invalid_aiml_file(self):
        self.util.it(['returns 400 on compile failures','identifies invalid aiml files.'])
        self.util.get_ready_to_fail()
        result = subprocess.Popen([
            cli, 'compile',
            '--app_id', config['appId'],
            '--user_key', config['userKey'],
            '--botname', config['botName'],
            '--hostname', self.hostname
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        console_output = []
        for line in result.stdout:
            console_output.append(line.rstrip('\n').rstrip('\t').strip())

        self.assertTrue('filename: \'invalid.aiml\' }' in console_output)
        self.assertTrue('400' in console_output[len(console_output)-1])

    def test_invalid_botName(self):
        self.util.it('returns 400 if the botname is invalid.')

        result = subprocess.Popen([
                cli, 'compile',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', 'ABCDEFG',
                '--hostname', self.hostname
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('400' in result.stdout.read())

    def test_bot_not_found(self):
        self.util.it('returns 400 if the bot does not exist.')

        result = subprocess.Popen([
                cli, 'compile',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', '12345',
                '--hostname', self.hostname
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('400' in result.stdout.read())

    def test_invalid_userKey(self):
        self.util.it('returns 401 if the user_key is invalid.')

        result = subprocess.Popen([
                cli, 'compile',
                '--app_id', config['appId'],
                '--user_key', '12345',
                '--botname', config['botName'],
                '--hostname', self.hostname
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def test_invalid_appId(self):
        self.util.it('returns 401 if the app_id is invalid.')

        result = subprocess.Popen([
                cli, 'compile',
                '--app_id', '12345',
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def tearDown(self):
        self.util.delete_bot()

if __name__ == "__main__":
    unittest.main()
