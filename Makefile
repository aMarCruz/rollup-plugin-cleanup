
MAKECC = $(TRAVIS_BRANCH) $(TRAVIS_NODE_VERSION)

sendcover:
ifeq ($(MAKECC),master 6.14)
	@ npm install -g codeclimate-test-reporter
	@ codeclimate-test-reporter < coverage/lcov.info
endif

.PHONY: sendcover
