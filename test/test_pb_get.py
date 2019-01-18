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

class TestPBGet(unittest.TestCase):
    @classmethod
    def setUpClass(self):
	self.util = util.TestUtil()
	self.util.announce_test_block('pb get')
	self.hostname = config["hostname"]
	print self.hostname

    def setUp(self):
        self.util.create_bot()

    def test_get_file_list(self):
        self.util.it('returns a list of the bot\'s files.')
        self.util.get_ready_to_compile()
        result = subprocess.Popen([
            cli, 'get',
            '--app_id', config['appId'],
            '--user_key', config['userKey'],
            '--botname', config['botName'],
            '--hostname', self.hostname
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT)
	console_output = []
        for line in result.stdout:
	    console_output.append(line.rstrip('\n'))

        self.assertItemsEqual(console_output,
            ['testbot.properties', 'testbot.pdefaults', 'test.aiml', 'test.map', 'test.set', 'test.substitution'])

    def test_get_file_zip(self):
        self.util.it('downloads a zip of the bot\'s files with --all.')
        self.util.get_ready_to_compile()
        os.chdir(os.path.abspath(os.path.dirname(__file__) + '/test_data/test_output/'))
        result = subprocess.Popen([
            cli, 'get',
            '--app_id', config['appId'],
            '--user_key', config['userKey'],
            '--botname', config['botName'],
            '--hostname', self.hostname,
            '--all'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        time.sleep(2)

        self.assertTrue(os.path.isfile('testbot.zip'))
        self.util.delete_local_file('testbot.zip')

    def test_invalid_userKey(self):
        self.util.get_ready_to_compile()
        self.util.it('returns 401 if the user_key is invalid.')

        result = subprocess.Popen([
                cli, 'get',
                '--app_id', config['appId'],
                '--user_key', '12345',
                '--botname', config['botName'],
                '--hostname', self.hostname
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def test_invalid_appId(self):
        self.util.get_ready_to_compile()
        self.util.it('returns 401 if the app_id is invalid.')

        result = subprocess.Popen([
                cli, 'get',
                '--app_id', '12345',
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def test_invalid_botName(self):
        self.util.get_ready_to_compile()
        self.util.it('returns 400 if the botname is invalid.')

        result = subprocess.Popen([
                cli, 'get',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', 'ABCDEFG',
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('400' in result.stdout.read())

    def test_bot_not_found(self):
        self.util.get_ready_to_compile()
        self.util.it('returns 404 if the bot does not exist.')

        result = subprocess.Popen([
                cli, 'get',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', '12345',
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('404' in result.stdout.read())

    def tearDown(self):
        self.util.delete_bot()

if __name__ == "__main__":
    unittest.main()
