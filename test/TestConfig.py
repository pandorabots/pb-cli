import os
import json

with open(os.path.abspath(os.path.dirname(__file__) + '/config.json'), 'r') as f:
    raw_config = json.load(f)

class TestConfig:
    def setEnvironment(self,test_env):
        config = {}
        config["botName"] = raw_config["botName"]
        if test_env == 'development':
            test_env = 'aiaasst'

        if(raw_config["hosts"][test_env]):
            config["hostname"]= raw_config["hosts"][test_env]["hostname"]
            config["userKey"] = raw_config["hosts"][test_env]["userKey"]
            config["appId"] = raw_config["hosts"][test_env]["appId"]
            config["botKey"] = raw_config["hosts"][test_env]["botKey"]
            config["expectations"]= raw_config["hosts"][test_env]["expectations"]
        else:
            config["hostname"] = raw_config["hosts"]["production"]["hostname"]
            config["userKey"] = raw_config["hosts"]["production"]["userKey"]
            config["appId"] = raw_config["hosts"]["production"]["appId"]
            config["botKey"] = raw_config["hosts"]["production"]["botKey"]
            config["expectations"] = raw_config["hosts"]["production"]["expectations"]
        return config
