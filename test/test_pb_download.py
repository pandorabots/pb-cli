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

class TestPBDownload(unittest.TestCase):
    @classmethod
    def setUpClass(self):
	self.util = util.TestUtil()
	self.util.announce_test_block('pb download')
	self.hostname = config["hostname"]
	print self.hostname

    def setUp(self):
        self.util.create_and_compile()

    def test_download_aiml_file(self):
        self.util.it('downloads an aiml file from the api.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.aiml',
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test_output')
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        time.sleep(3)

        self._assert_local_file_exists(filename='test.aiml')
        self.util.delete_local_file(filename='test.aiml')

    def test_download_map_file(self):
        self.util.it('downloads a map file from the api.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.map',
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test_output')
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        time.sleep(3)

        self._assert_local_file_exists(filename='test.map')
        self.util.delete_local_file(filename='test.map')

    def test_download_set_file(self):
        self.util.it('downloads a set file from the api.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.set',
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test_output')
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        time.sleep(3)

        self._assert_local_file_exists(filename='test.set')
        self.util.delete_local_file(filename='test.set')

    def test_download_substitution_file(self):
        self.util.it('downloads a substitution file from the api.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.substitution',
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test_output')
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        time.sleep(2)

        self._assert_local_file_exists(filename='test.substitution')
        self.util.delete_local_file(filename='test.substitution')

    def test_download_pdefaults_file(self):
        self.util.it('downloads a pdefaults file from the api.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'testbot.pdefaults',
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test_output')
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        time.sleep(3)

        self._assert_local_file_exists(filename='testbot.pdefaults')
        self.util.delete_local_file(filename='testbot.pdefaults')

    def test_download_properties_file(self):
        self.util.it('downloads a properties file from the api.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'testbot.properties',
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test_output')
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        time.sleep(3)

        self._assert_local_file_exists(filename='testbot.properties')
        self.util.delete_local_file(filename='testbot.properties')

    def test_invalid_botName(self):
        self.util.it('returns 400 if the botname is invalid.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', 'ABCDEFG',
                '--hostname', self.hostname,
                'test.aiml'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('400' in result.stdout.read())

    def test_bot_not_found(self):
        self.util.it('returns 404 if the bot does not exist.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', '12345',
                '--hostname', self.hostname,
                'test.aiml'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('404' in result.stdout.read())

    def test_bot_not_found(self):
        self.util.it('returns 412 if the file does not exist.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'fake.aiml'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('412' in result.stdout.read())

    def test_invalid_userKey(self):
        self.util.it('returns 401 if the user_key is invalid.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', config['appId'],
                '--user_key', '12345',
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.aiml'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def test_invalid_appId(self):
        self.util.it('returns 401 if the app_id is invalid.')

        result = subprocess.Popen([
                cli, 'download',
                '--app_id', '12345',
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', self.hostname,
                'test.aiml'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def tearDown(self):
        self.util.delete_bot()

    def _assert_local_file_exists(self, filename):
        self.assertTrue(os.path.isfile(os.path.abspath(
            os.path.dirname(__file__) + '/test_data/test_output/' + filename
        )))

if __name__ == "__main__":
    unittest.main()
