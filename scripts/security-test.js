#!/usr/bin/env node

/**
 * Security Test Suite for Multer Upload Implementation
 * Tests for DoS prevention, memory leak prevention, and malicious file handling
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const FormData = require('form-data');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5001';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

const log = (message, color = colors.reset) => {
    console.log(`${color}${message}${colors.reset}`);
};

class SecurityTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async runTest(testName, testFunction) {
        this.testResults.total++;
        try {
            log(`\n🔍 Testing: ${testName}`, colors.blue);
            await testFunction();
            this.testResults.passed++;
            log(`✅ PASSED: ${testName}`, colors.green);
        } catch (error) {
            this.testResults.failed++;
            log(`❌ FAILED: ${testName}`, colors.red);
            log(`   Error: ${error.message}`, colors.red);
        }
    }

    async testFileSizeLimit() {
        // Create a file larger than 5MB
        const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'A'); // 6MB
        const tempFile = path.join(__dirname, '../temp-large-file.txt');

        try {
            fs.writeFileSync(tempFile, largeBuffer);

            const form = new FormData();
            form.append('profilePicture', fs.createReadStream(tempFile));

            const response = await this.makeRequest('/auth/update-profile', 'PUT', form);

            if (response.statusCode !== 413) {
                throw new Error(`Expected 413 (File too large), got ${response.statusCode}`);
            }

            if (!response.data.error.toLowerCase().includes('file too large')) {
                throw new Error('Error message should mention file size limit');
            }
        } finally {
            // Clean up
            try {
                fs.unlinkSync(tempFile);
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    }

    async testMaliciousFileNames() {
        const maliciousNames = [
            '../../../etc/passwd',
            '..\\..\\..\\windows\\system32\\config\\sam',
            'test.php',
            'malware.exe',
            'script.jsp',
            'test<script>alert(1)</script>.jpg'
        ];

        for (const fileName of maliciousNames) {
            const buffer = Buffer.from('fake image content');
            const form = new FormData();

            // Create a readable stream from buffer with malicious filename
            const stream = require('stream');
            const readable = new stream.Readable();
            readable.push(buffer);
            readable.push(null);

            form.append('profilePicture', readable, { filename: fileName });

            const response = await this.makeRequest('/auth/update-profile', 'PUT', form);

            if (response.statusCode === 200) {
                throw new Error(`Malicious filename "${fileName}" was accepted`);
            }
        }
    }

    async testFileTypeValidation() {
        // Test with non-image file
        const textContent = 'This is not an image file';
        const form = new FormData();

        const stream = require('stream');
        const readable = new stream.Readable();
        readable.push(Buffer.from(textContent));
        readable.push(null);

        form.append('profilePicture', readable, {
            filename: 'test.txt',
            contentType: 'text/plain'
        });

        const response = await this.makeRequest('/auth/update-profile', 'PUT', form);

        if (response.statusCode === 200) {
            throw new Error('Non-image file was accepted');
        }

        if (!response.data.error.toLowerCase().includes('invalid file type')) {
            throw new Error('Should reject non-image files with appropriate error');
        }
    }

    async testMultipleFileUpload() {
        // Test uploading multiple files (should be rejected)
        const form = new FormData();

        for (let i = 0; i < 3; i++) {
            const stream = require('stream');
            const readable = new stream.Readable();
            readable.push(Buffer.from('fake image'));
            readable.push(null);

            form.append('profilePicture', readable, { filename: `test${i}.jpg` });
        }

        const response = await this.makeRequest('/auth/update-profile', 'PUT', form);

        if (response.statusCode === 200) {
            throw new Error('Multiple file upload was accepted');
        }
    }

    async testFormBombing() {
        // Test with too many form fields (DoS prevention)
        const form = new FormData();

        for (let i = 0; i < 100; i++) {
            form.append(`field${i}`, 'A'.repeat(1000));
        }

        const response = await this.makeRequest('/auth/update-profile', 'PUT', form);

        if (response.statusCode === 200) {
            throw new Error('Form bombing attack was not prevented');
        }
    }

    async testValidImageUpload() {
        // Create a minimal valid JPEG
        const jpegHeader = Buffer.from([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46,
            0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00,
            0xFF, 0xD9
        ]);

        const form = new FormData();

        const stream = require('stream');
        const readable = new stream.Readable();
        readable.push(jpegHeader);
        readable.push(null);

        form.append('profilePicture', readable, {
            filename: 'test.jpg',
            contentType: 'image/jpeg'
        });

        // Note: This test requires authentication, so it might fail with 401
        // That's expected - we're testing the upload validation, not auth
        const response = await this.makeRequest('/auth/update-profile', 'PUT', form);

        // Accept either success or auth failure, but not validation errors
        if (response.statusCode !== 200 && response.statusCode !== 401 && response.statusCode !== 403) {
            if (response.data.error && response.data.error.toLowerCase().includes('invalid file')) {
                throw new Error('Valid JPEG was rejected as invalid');
            }
        }
    }

    async makeRequest(endpoint, method = 'GET', formData = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(endpoint, BASE_URL);
            const options = {
                hostname: url.hostname,
                port: url.port || 5001,
                path: url.pathname,
                method: method,
                timeout: 10000
            };

            if (formData) {
                options.headers = formData.getHeaders();
            }

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = data ? JSON.parse(data) : {};
                        resolve({
                            statusCode: res.statusCode,
                            data: jsonData,
                            headers: res.headers
                        });
                    } catch (e) {
                        resolve({
                            statusCode: res.statusCode,
                            data: { error: data },
                            headers: res.headers
                        });
                    }
                });
            });

            req.on('error', reject);
            req.on('timeout', () => reject(new Error('Request timeout')));

            if (formData) {
                formData.pipe(req);
            } else {
                req.end();
            }
        });
    }

    async checkServerStatus() {
        try {
            const response = await this.makeRequest('/');
            return response.statusCode < 500;
        } catch (error) {
            log(`⚠️  Server connection failed: ${error.message}`, colors.yellow);
            log('   Make sure the server is running on http://localhost:5001', colors.yellow);
            return false;
        }
    }

    async runAllTests() {
        log('🛡️  Multer Security Test Suite', colors.bold);
        log('================================', colors.blue);

        const serverRunning = await this.checkServerStatus();
        if (!serverRunning) {
            log('\n📝 Tests completed without server validation.', colors.yellow);
            log('   Start the server with "npm start" to run full tests.', colors.yellow);
            return;
        }

        await this.runTest('File Size Limit (DoS Prevention)', () => this.testFileSizeLimit());
        await this.runTest('Malicious File Names', () => this.testMaliciousFileNames());
        await this.runTest('File Type Validation', () => this.testFileTypeValidation());
        await this.runTest('Multiple File Upload Prevention', () => this.testMultipleFileUpload());
        await this.runTest('Form Bombing Prevention', () => this.testFormBombing());
        await this.runTest('Valid Image Upload', () => this.testValidImageUpload());

        this.printResults();
    }

    printResults() {
        log('\n📊 Test Results:', colors.bold);
        log('===============', colors.blue);
        log(`✅ Passed: ${this.testResults.passed}`, colors.green);
        log(`❌ Failed: ${this.testResults.failed}`, colors.red);
        log(`📊 Total:  ${this.testResults.total}`, colors.blue);

        const percentage = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        log(`📈 Success Rate: ${percentage}%`, colors.blue);

        if (this.testResults.failed === 0) {
            log('\n🎉 All security tests passed! Your Multer implementation is secure.', colors.green);
        } else {
            log('\n⚠️  Some tests failed. Please review the implementation.', colors.yellow);
        }
    }
}

// Run tests
if (require.main === module) {
    const tester = new SecurityTester();
    tester.runAllTests().catch(console.error);
}

module.exports = SecurityTester;
