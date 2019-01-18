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

class TestPBCreate(unittest.TestCase):
    @classmethod
    def setUpClass(self):
	self.util = util.TestUtil()
	self.util.announce_test_block('pb create')
	self.hostname = config["hostname"]
	print self.hostname

    def test_create_bot(self):
        self.util.it('creates a new bot on aiaas.')
        bot_list = self.util.get_bot_list()
        self.assertFalse("testbot" in bot_list)

        result = subprocess.Popen([
            cli, 'create',
            '--app_id', config['appId'],
            '--user_key', config['userKey'],
            '--botname', config['botName'],
            '--hostname', self.hostname
        ],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        time.sleep(1)

        bot_list = self.util.get_bot_list()
        self.assertTrue("testbot" in bot_list)

    def test_invalid_botName(self):
        self.util.it('returns 400 if the botname is invalid.')

        result = subprocess.Popen([
                cli, 'create',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', 'ABCDEFG',
                '--hostname', self.hostname
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('400' in result.stdout.read())

    def test_bot_already_exists(self):
        self.util.create_bot()
        self.util.it('returns 409 if the bot already exists.')

        result = subprocess.Popen([
                cli, 'create',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('409' in result.stdout.read())

    def test_invalid_userKey(self):
        self.util.it('returns 401 if the user_key is invalid.')

        result = subprocess.Popen([
                cli, 'create',
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
                cli, 'create',
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
