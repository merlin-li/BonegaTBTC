.PHONY: test ropsten_deploy ropsten_test local_deploy

test:
	etherlime test --path ./test/local --timeout 20000

local_deploy:
	etherlime deploy --file deployment/deploy_local.js

ropsten_test:
	etherlime test --path ./test/ropsten --timeout 1000000

ropsten_deploy:
	etherlime deploy --file deployment/deploy.js