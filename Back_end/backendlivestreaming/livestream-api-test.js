const fetch = require('node-fetch');
const FormData = require('form-data');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Environment Setup
const environment = {
    base_url: "http://localhost:3000/api",
    variables: {
        stream_key: "",
        streamer_id: "",
        viewer_id: "",
        chat_id: ""
    }
};

// Helper function to check if server is running
async function checkServer() {
    try {
        await fetch(environment.base_url);
        return true;
    } catch (error) {
        console.error('Server is not running. Please start the server first.');
        console.error('Run: npm run dev');
        return false;
    }
}

// Helper function for assertions
function assertResponse(response) {
    if (!response.success) {
        throw new Error(`API returned error: ${response.error}`);
    }
    assert(response.data, "Response should contain data");
}

// 1. Stream Creation Tests
const streamCreationTests = {
    name: "Stream Creation Tests",
    tests: [
        {
            name: "Create stream successfully",
            request: {
                method: "POST",
                endpoint: "/streams/create",
                body: {
                    title: "Test Stream",
                    streamer_name: "Test Streamer"
                }
            },
            test: function(response) {
                assertResponse(response);
                assert(response.data.stream.stream_key);
                assert(response.data.streamer.id);

                environment.variables.stream_key = response.data.stream.stream_key;
                environment.variables.streamer_id = response.data.streamer.id;
            }
        },
        {
            name: "Create stream without title",
            request: {
                method: "POST",
                endpoint: "/streams/create",
                body: { streamer_name: "Test Streamer" }
            },
            test: function(response) {
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.success, false);
                assert.strictEqual(response.error, "Title is required");
            }
        },
        {
            name: "Create stream without streamer name",
            request: {
                method: "POST",
                endpoint: "/streams/create",
                body: { title: "Test Stream" }
            },
            test: function(response) {
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.success, false);
                assert.strictEqual(response.error, "Streamer name is required");
            }
        }
    ]
};

// 2. Stream Join Tests
const streamJoinTests = {
    name: "Stream Join Tests",
    tests: [
        {
            name: "Streamer rejoin stream",
            request: {
                method: "POST",
                endpoint: "/streams/streamer/join/{{stream_key}}",
            },
            test: function(response) {
                assertResponse(response);
                assert.strictEqual(response.data.participant.role, 'streamer');
            }
        },
        {
            name: "Viewer join with valid display name",
            request: {
                method: "POST",
                endpoint: "/streams/viewer/join/{{stream_key}}",
                body: {
                    display_name: "Test Viewer"
                }
            },
            test: function(response) {
                assert.strictEqual(response.status, 200);
                assert.strictEqual(response.success, true);
                assert.strictEqual(response.data.participant.role, 'viewer');
                saveEnvironmentVariable('viewer_id', response.data.participant.id);
            }
        },
        {
            name: "Viewer join without display name",
            request: {
                method: "POST",
                endpoint: "/streams/viewer/join/{{stream_key}}",
                body: {}
            },
            test: function(response) {
                assert.strictEqual(response.status, 400);
                assert.strictEqual(response.success, false);
                assert.strictEqual(response.error, "Display name is required");
            }
        }
    ]
};

// 3. Chat Tests
const chatTests = {
    name: "Chat Tests",
    tests: [
        {
            name: "Send text message",
            request: {
                method: "POST",
                endpoint: "/streams/chat/{{stream_key}}",
                body: {
                    message: "Test message"
                }
            },
            test: function(response) {
                assertResponse(response);
                assert(response.data.chat);
                assert.strictEqual(response.data.chat.message, "Test message");
            }
        },
        {
            name: "Get chat history",
            request: {
                method: "GET",
                endpoint: "/streams/chat/{{stream_key}}"
            },
            test: function(response) {
                assertResponse(response);
                assert(Array.isArray(response.data));
            }
        }
    ]
};

// 4. Ban/Kick Tests
const banTests = {
    name: "Ban/Kick Tests",
    tests: [
        {
            name: "Streamer kicks viewer",
            request: {
                method: "POST",
                endpoint: "/streams/kick/{{stream_key}}",
                body: {
                    participant_id: "{{viewer_id}}",
                    reason: "Test kick"
                }
            },
            test: function(response) {
                assertResponse(response);
                assert(response.data.banned_participant);
                assert.strictEqual(response.data.banned_participant.id, parseInt(environment.variables.viewer_id));
            }
        },
        {
            name: "Temporary ban",
            request: {
                method: "POST",
                endpoint: "/streams/kick/{{stream_key}}",
                body: {
                    participant_id: "{{viewer_id}}",
                    duration: 30,
                    reason: "Test temporary ban"
                }
            },
            test: function(response) {
                assertResponse(response);
                assert(response.data.ban_end_time);
            }
        }
    ]
};

// 5. End Stream Tests
const endStreamTests = {
    name: "End Stream Tests",
    tests: [
        {
            name: "Streamer ends stream",
            request: {
                method: "POST",
                endpoint: "/streams/end/{{stream_key}}"
            },
            test: function(response) {
                assertResponse(response);
                assert.strictEqual(response.data.status, 'inactive');
            }
        },
        {
            name: "Viewer tries to end stream",
            request: {
                method: "POST",
                endpoint: "/streams/end/{{stream_key}}",
                headers: {
                    "X-Viewer-ID": "{{viewer_id}}"
                }
            },
            test: function(response) {
                assert.strictEqual(response.status, 403);
                assert.strictEqual(response.success, false);
                assert.strictEqual(response.error, "Only the streamer can end this live stream");
            }
        }
    ]
};

// Helper function to log response
function logResponse(testName, response) {
    console.log(`\nResponse for "${testName}":`);
    console.log(JSON.stringify(response, null, 2));
}

// Helper function to send requests
async function sendRequest(requestConfig) {
    try {
        const endpoint = requestConfig.endpoint.replace(/{{(\w+)}}/g, (_, key) =>
            environment.variables[key.toLowerCase()]
        );

        const url = environment.base_url + endpoint;
        const options = {
            method: requestConfig.method,
            headers: {
                'Content-Type': 'application/json',
                ...requestConfig.headers
            }
        };

        if (requestConfig.body) {
            options.body = JSON.stringify(requestConfig.body);
        }

        if (requestConfig.formData) {
            const formData = new FormData();
            for (const [key, value] of Object.entries(requestConfig.formData)) {
                if (key === 'file') {
                    const filePath = path.resolve(__dirname, 'test-files', value);
                    console.log('File path:', filePath);
                    if (fs.existsSync(filePath)) {
                        const fileStream = fs.createReadStream(filePath);
                        formData.append(key, fileStream);
                    } else {
                        throw new Error(`Test file not found: ${filePath}`);
                    }
                } else {
                    formData.append(key, value);
                }
            }
            options.body = formData;
            delete options.headers['Content-Type'];
        }

        console.log(`\nRequest to: ${url}`);
        console.log('Method:', options.method);
        if (options.body) {
            console.log('Body:', typeof options.body === 'string' ? JSON.parse(options.body) : '[FormData]');
        }

        const response = await fetch(url, options);
        const json = await response.json();
        json.status = response.status;
        return json;
    } catch (error) {
        console.error('\nRequest failed:');
        console.error('Error:', error);
        throw error;
    }
}

// Run all tests
async function runAllTests() {
    if (!await checkServer()) {
        process.exit(1);
    }

    const allTestSuites = [
        streamCreationTests,
        streamJoinTests,
        chatTests,
        banTests,
        endStreamTests
    ];

    let passedTests = 0;
    let failedTests = 0;

    for (const suite of allTestSuites) {
        console.log(`\nRunning ${suite.name}`);
        for (const test of suite.tests) {
            try {
                console.log(`\n  - ${test.name}`);
                const response = await sendRequest(test.request);

                // Log response before running test
                logResponse(test.name, response);

                await test.test(response);
                console.log('    ✓ Passed');
                passedTests++;
            } catch (error) {
                console.error(`    ✗ Failed:`, error.message);
                failedTests++;
            }
        }
    }

    console.log('\nTest Summary:');
    console.log(`Total: ${passedTests + failedTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);

    if (failedTests > 0) {
        process.exit(1);
    }
}

// Start tests
if (require.main === module) {
    runAllTests().catch(error => {
        console.error("Test execution failed:", error);
        process.exit(1);
    });
}

module.exports = {
    runAllTests,
    environment
};

function saveEnvironmentVariable(key, value) {
    environment.variables[key.toLowerCase()] = value;
    console.log(`Saved ${key}: ${value}`);
}
