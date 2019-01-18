import unittest
import subprocess
import json
import os
import util
from TestConfig import *

config = {}
test_env = os.getenv('test_env', 'aiaas')
env_setup = TestConfig()
config = env_setup.setEnvironment(test_env)

cli = os.path.abspath('./pb-cli/index.js')

class TestPBList(unittest.TestCase):
    @classmethod
    def setUpClass(self):
	self.util = util.TestUtil()
	self.util.announce_test_block('pb list')
	self.hostname = config["hostname"]
	print self.hostname

    def test_list_bots(self):
        self.util.it('prints a full list of the user\'s bots.')
        result = subprocess.Popen([
            cli, 'list',
            '--app_id', config['appId'],
            '--user_key', config['userKey'],
            '--hostname', self.hostname,
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        bot_list = []
	for line in result.stdout:
	    bot_list.append(line.rstrip('\n'))
	self.assertEqual(bot_list, config['expectations']['bot_list'])

    def test_invalid_userKey(self):
        self.util.it('returns 401 if the user_key is invalid.')

        result = subprocess.Popen([
                cli, 'list',
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
                cli, 'list',
                '--app_id', '12345',
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

if __name__ == "__main__":
    unittest.main()
