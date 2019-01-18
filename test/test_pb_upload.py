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

class TestPBUpload(unittest.TestCase):
    @classmethod
    def setUpClass(self):
	self.util = util.TestUtil()
	self.util.announce_test_block('pb upload')
	self.hostname = config["hostname"]
	print self.hostname

    def setUp(self):
        self.util.create_bot()

    def test_upload_aiml(self):
        self.util.it('successfully uploads an aiml file.')
        bot_files = self.util.get_file_list()
        self.assertFalse('test.aiml' in bot_files)

        result = subprocess.Popen([
                cli,
                'upload',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test.aiml')
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertTrue('test.aiml' in bot_files)

    def test_upload_set(self):
        self.util.it('successfully uploads a set file.')
        bot_files = self.util.get_file_list()
        self.assertFalse('test.set' in bot_files)

        result = subprocess.Popen([
                cli,
                'upload',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test.set')
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertTrue('test.set' in bot_files)

    def test_upload_map(self):
        self.util.it('successfully uploads a map file.')
        bot_files = self.util.get_file_list()
        self.assertFalse('test.map' in bot_files)

        result = subprocess.Popen([
                cli,
                'upload',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test.map')
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertTrue('test.map' in bot_files)

    def test_map_failure(self):
        self.util.it(['rejects files with invalid json', 'returns status 400.'])
        result = subprocess.Popen([
                cli,
                'upload',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/invalid.map')
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        time.sleep(1)

        self.assertTrue('400' in result.stdout.read())

    def test_upload_substitution(self):
        self.util.it('successfully uploads a substitution file.')
        bot_files = self.util.get_file_list()
        self.assertFalse('test.substitution' in bot_files)

        result = subprocess.Popen([
                cli,
                'upload',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test.substitution')
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertTrue('test.substitution' in bot_files)

    def test_upload_properties(self):
        self.util.it('successfully uploads a properties file.')
        result = subprocess.Popen([
                cli,
                'upload',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test.properties')
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        time.sleep(1)

        self.util.download_file('testbot.properties')

        with open(os.path.abspath(os.path.dirname(__file__) + '/test_data/test_output/testbot.properties')) as f:
            f = json.load(f)
            file_content = f

        self.assertTrue(['name', 'Testbot'] in file_content)

        self.util.delete_local_file('testbot.properties')

    def test_upload_pdefaults(self):
        self.util.it('successfully uploads a pdefaults file.')
        bot_files = self.util.get_file_list()
        try:
            self.assertFalse('testbot.pdefaults' in bot_files)
        except:
            self.util.delete_file(filename='testbot.pdefaults')
            time.sleep(1)
            bot_files = self.util.get_file_list()
            self.assertFalse('testbot.pdefaults' in bot_files)

        result = subprocess.Popen([
                cli,
                'upload',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test.pdefaults')
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        time.sleep(1)

        bot_files = self.util.get_file_list()
        self.assertTrue('testbot.pdefaults' in bot_files)

        self.util.delete_file(filename='testbot.pdefaults')

    def test_invalid_botName(self):
        self.util.it('returns 400 if the botname is invalid.')

        result = subprocess.Popen([
                cli, 'upload',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', 'ABCDEFG',
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test.aiml')
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('400' in result.stdout.read())

    def test_bot_not_found(self):
        self.util.it('returns 412 if the bot does not exist.')

        result = subprocess.Popen([
                cli, 'upload',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', '123456',
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test.aiml')
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('412' in result.stdout.read())

    def test_invalid_userKey(self):
        self.util.it('returns 401 if the user_key is invalid.')

        result = subprocess.Popen([
                cli, 'upload',
                '--app_id', config['appId'],
                '--user_key', '12345',
                '--botname', config['botName'],
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test.aiml')
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def test_invalid_appId(self):
        self.util.it('returns 401 if the app_id is invalid.')

        result = subprocess.Popen([
                cli, 'upload',
                '--app_id', '12345',
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test.aiml')
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def tearDown(self):
        self.util.delete_bot()

if __name__ == "__main__":
    unittest.main()
