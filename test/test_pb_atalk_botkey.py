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

class TestPBAtalk(unittest.TestCase):
    @classmethod
    def setUpClass(self):
        self.util = util.TestUtil()
        self.util.announce_test_block('pb atalk botkey')
        self.hostname = config["hostname"]
        print self.hostname

    def test_atalk_to_bot(self):
        self.util.create_and_compile()
        self.util.it(['responds correctly to user input', 'returns a new client_name for bot interactions.'])
        result = subprocess.Popen([
                cli, 'atalk',
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
        self.assertTrue('atalk: client_name was set' in bot_response[0])

    def test_preserves_predicates(self):
        self.util.create_and_compile()
        self.util.it('stores predicates for the client_name.')
        result = subprocess.Popen([
                cli, 'atalk',
                '--botkey', config['botKey'],
                '--hostname', self.hostname,
                'xfruit apple'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        bot_response = []
        for line in result.stdout:
            bot_response.append(line.rstrip('\n'))

	client_name = bot_response[0].split(' ')
	client_name = client_name[len(client_name)-1]

        result = subprocess.Popen([
                cli, 'talk',
                '--botkey', config['botKey'],
                '--hostname', self.hostname,
                '--client_name', client_name,
		'get xfruit'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertEqual("The stored 'fruit' predicate is apple.\n", result.stdout.read())

    def test_reset_flag(self):
        self.util.create_and_compile()
        self.util.it('forgets predicates for the client_name when --reset is set.')
        result = subprocess.Popen([
                cli, 'atalk',
                '--botkey', config['botKey'],
                '--hostname', self.hostname,
                'xfruit apple'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        bot_response = []
        for line in result.stdout:
            bot_response.append(line.rstrip('\n'))

        client_name = bot_response[0].split(' ')
        client_name = client_name[len(client_name)-1]

        result = subprocess.Popen([
                cli, 'talk',
                '--botkey', config['botKey'],
                '--hostname', self.hostname,
		'--client_name',client_name,
                'get xfruit', '--reset'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT)

        self.assertEqual("The stored 'fruit' predicate is unknown.\n", result.stdout.read())

    def test_not_compiled(self):
        self.util.create_bot()
        self.util.it('returns 412 if the bot is not compiled.')

        result = subprocess.Popen([
                cli, 'atalk',
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
                cli, 'atalk',
                '--botkey', 'ABCDEDIF',
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
        conn.request("POST", "/atalk?botkey=" + config['botKey'] + "&input=" + "Hi!" + "&channel=63")

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
