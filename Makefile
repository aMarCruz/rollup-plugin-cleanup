
MAKECC = $(TRAVIS_BRANCH) $(TRAVIS_NODE_VERSION)

sendcover:
ifeq ($(MAKECC),master 4.2)
	@ npm install -g codeclimate-test-reporter
	@ codeclimate-test-reporter < coverage/lcov.info
endif

.PHONY: sendcover
