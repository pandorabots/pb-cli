import os
import json
import subprocess
import time
from TestConfig import *

font_style = {
    'blue': '\033[94m',
    'green': '\033[92m',
    'yellow': '\033[93m',
    'red': '\033[91m',
    'end': '\033[0m',
    'bold': '\033[1m',
    'underline': '\033[4m'
}
config = {}
test_env = os.getenv('test_env', 'aiaas')
env_setup = TestConfig()
config = env_setup.setEnvironment(test_env)

class TestUtil(object):

    def create_bot(self, botname=config['botName']):
        hostname = self.get_hostname()
        result = subprocess.Popen([
            'pb', 'create',
            '--app_id', config['appId'],
            '--user_key', config['userKey'],
            '--botname', botname,
            '--hostname', hostname
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        time.sleep(1)

    def get_bot_list(self):
        hostname = self.get_hostname()
        result = subprocess.Popen([
            'pb', 'list',
            '--app_id', config['appId'],
            '--user_key', config['userKey'],
            '--hostname', hostname,
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

        bot_list = []
        for line in result.stdout:
            bot_list.append(line.rstrip('\n'))
        return bot_list

    def get_file_list(self):
        hostname = self.get_hostname()
        result = subprocess.Popen([
            'pb', 'get',
            '--app_id', config['appId'],
            '--user_key', config['userKey'],
            '--botname', config['botName'],
            '--hostname', hostname
            ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        file_list = []
        for line in result.stdout:
            file_list.append(line.rstrip('\n'))
        return file_list

    def delete_bot(self, botname=config['botName']):
        hostname = self.get_hostname()
        result = subprocess.Popen(
            [
                'pb', 'delete',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', botname,
                '--hostname', hostname
            ],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        result.communicate(input='yes')
        time.sleep(1)

    def delete_file(self, filename, botname=config['botName']):
        hostname = self.get_hostname()
        result = subprocess.Popen([
                'pb',
                'remove',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', hostname,
                filename
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        result.communicate(input='yes')
        time.sleep(1)

    def download_file(self, filename, botname=config['botName']):
        hostname = self.get_hostname()
        result = subprocess.Popen([
                'pb',
                'download',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', hostname,
                filename,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/test_output')
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        time.sleep(3)


    def upload_file(self, filename, botname=config['botName']):
        hostname = self.get_hostname()
        result = subprocess.Popen([
                'pb',
                'upload',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', botname,
                '--hostname', hostname,
                os.path.abspath(os.path.dirname(__file__) + '/test_data/' + filename)
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        time.sleep(1)

    def get_ready_to_compile(self):
        self.upload_file(filename='test.aiml')
        self.upload_file(filename='test.map')
        self.upload_file(filename='test.pdefaults')
        self.upload_file(filename='test.properties')
        self.upload_file(filename='test.set')
        self.upload_file(filename='test.substitution')

    def get_ready_to_fail(self):
        self.upload_file(filename='invalid.aiml')
        self.upload_file(filename='test.map')
        self.upload_file(filename='test.pdefaults')
        self.upload_file(filename='test.properties')
        self.upload_file(filename='test.set')
        self.upload_file(filename='test.substitution')

    def compile_bot(self):
        hostname = self.get_hostname()
        result = subprocess.Popen([
                'pb', 'compile',
                '--app_id', config['appId'],
                '--user_key', config['userKey'],
                '--botname', config['botName'],
                '--hostname', hostname,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        time.sleep(1)

    def create_and_compile(self):
        self.create_bot()
        self.get_ready_to_compile()
        self.compile_bot()

    def announce_test_block(self, name='next'):
        print '\nRunning ' + font_style['yellow'] + font_style['bold'] + name + font_style['end'] + ' test cases.'

    def it(self, text='runs the next test'):
        print '\n'
        if isinstance(text, list):
            for index, line in enumerate(text):
                if index == 0:
                    print 'It ' + line
                else:
                    print '& ' + line
        else:
            print 'It ' + text

    def delete_local_file(self, filename):
        os.remove(os.path.abspath(os.path.dirname(__file__) + '/test_data/test_output/' + filename))

    def get_hostname(self):
	return config['hostname']
