import unittest
import subprocess
import json
import os
import util
import time

from datetime import datetime
import httplib, urllib

from TestConfig import *

config = {}
test_env = os.getenv('test_env', 'aiaas')
env_setup = TestConfig()
config = env_setup.setEnvironment(test_env)

cli = os.path.abspath('./pb-cli/index.js')

class TestPBTalkBotkey(unittest.TestCase):
    @classmethod
    def setUpClass(self):
        self.util = util.TestUtil()
        self.util.announce_test_block('pb talk botkey')
        self.hostname = config["hostname"]
	print self.hostname

    def test_talk_to_bot(self):
        self.util.create_and_compile()
        self.util.it('responds correctly to user input.')
        #result = subprocess.check_output([cli,'talk','--botkey', config["botKey"] ,'--hostname',config["hostname"],'xtest'])
	result = subprocess.Popen([
                cli, 'talk',
		'--botkey', config['botKey'],
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
                '--botkey', config['botKey'],
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
                '--botkey', config['botKey'],
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
                '--botkey', config['botKey'],
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
                '--botkey', config['botKey'],
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)
        self.assertTrue('412' in result.stdout.read())

    def test_invalid_botkey(self):
        self.util.create_and_compile()
        self.util.it('returns 401 if the botkey is invalid.')
        result = subprocess.Popen([
                cli, 'talk',
                '--botkey', 'ABCDEFG',
                '--hostname', self.hostname,
                'xtest'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertTrue('401' in result.stdout.read())

    def test_channel_option(self):
        self.util.create_and_compile()
        self.util.it('marks the channel in the logs if one is supplied.')

        channel_assertion = 63

        before_request = str(datetime.now().isoformat())

        prod_url = self.hostname

        headers = {"Content-type": "application/x-www-form-urlencoded"}
        conn = httplib.HTTPSConnection(prod_url + ':443')
        conn.request("POST", "/talk?botkey=" + config['botKey'] + "&input=" + "Hi!" + "&channel=63")

        response = conn.getresponse()
        talk_data = json.loads(response.read())
        conn.close()

        conn = httplib.HTTPSConnection(prod_url + ':443')
        logs_query = "/log/query?botname=testbot&user_key=" + config['userKey'] + "&timeAfter=" + before_request + "&fields=sessionid,input,output"
        conn.request("GET", logs_query)

        query_response = conn.getresponse()
        query_data = json.loads(query_response.read())
        conn.close()

        channel = False

        for log in query_data['logs']:
            if log[0] == talk_data['sessionid']:
                channel = log[len(log) - 1]

        self.assertEqual(channel, 63)

    def tearDown(self):
        self.util.delete_bot()

if __name__ == "__main__":
    unittest.main()
