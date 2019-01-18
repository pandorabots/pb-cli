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

class TestPBRemove(unittest.TestCase):
    @classmethod
    def setUpClass(self):
	self.util = util.TestUtil()
	self.util.announce_test_block('pb remove')
	self.hostname = config["hostname"]
	print self.hostname

    def setUp(self):
        self.util.create_and_compile()

    def test_remove_aiml_file(self):
        self.util.it('removes an aiml file from the bot.')

        bot_files = self.util.get_file_list()
        self.assertTrue("test.aiml" in bot_files)

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.aiml'
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        result.communicate(input='yes')
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertFalse("test.aiml" in bot_files)

    def test_remove_map_file(self):
        self.util.it('removes a map file from the bot.')

        bot_files = self.util.get_file_list()
        self.assertTrue("test.map" in bot_files)

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.map'
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        result.communicate(input='yes')
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertFalse("test.map" in bot_files)

    def test_remove_set_file(self):
        self.util.it('removes a set file from the bot.')

        bot_files = self.util.get_file_list()
        self.assertTrue("test.set" in bot_files)

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.set'
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        result.communicate(input='yes')
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertFalse("test.set" in bot_files)

    def test_remove_substitution_file(self):
        self.util.it('removes a substitution file from the bot.')

        bot_files = self.util.get_file_list()
        self.assertTrue("test.substitution" in bot_files)

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.substitution'
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        result.communicate(input='yes')
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertFalse("test.substitution" in bot_files)

    def test_remove_pdefaults_file(self):
        self.util.it('removes a pdefaults file from the bot.')

        bot_files = self.util.get_file_list()
        self.assertTrue("testbot.pdefaults" in bot_files)

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'testbot.pdefaults'
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        result.communicate(input='yes')
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertFalse("testbot.pdefaults" in bot_files)

    def test_remove_properties_file(self):
        self.util.it('removes a properties file from the bot.')

        bot_files = self.util.get_file_list()
        self.assertTrue("testbot.properties" in bot_files)

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'testbot.properties'
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        result.communicate(input='yes')
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertFalse("testbot.properties" in bot_files)


    def test_invalid_botName(self):
        self.util.it('returns 400 if the botname is invalid.')

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', 'ABCDEFG',
                '--hostname', self.hostname,
                'test.aiml',
                '--yes'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('400' in result.stdout.read())

    def test_bot_not_found(self):
        self.util.it('returns 412 if the bot does not exist.')

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', '12345',
                '--hostname', self.hostname,
                'test.aiml',
                '--yes'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('412' in result.stdout.read())

    def test_file_not_found(self):
        self.util.it('returns 412 if the file does not exist.')

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'fake.aiml',
                '--yes'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('412' in result.stdout.read())

    def test_invalid_userKey(self):
        self.util.it('returns 401 if the user_key is invalid.')

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', config['appId'],
                '--user_key', '12345',
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.aiml',
                '--yes'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def test_invalid_appId(self):
        self.util.it('returns 401 if the app_id is invalid.')

        result = subprocess.Popen([
                cli, 'remove',
                '--app_id', '12345',
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.aiml',
                '--yes'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def tearDown(self):
        self.util.delete_bot()

if __name__ == "__main__":
    unittest.main()
