var Base64VlqCodecDemo = (function (exports) {
    'use strict';

    var BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var REVERSE_BASE64_ALPHABET = (function () {
        var characterIndexPairs = BASE64_ALPHABET.split('').map(function (c, i) { return [c, i]; });
        return new Map(characterIndexPairs);
    })();
    var BIT_MASKS = {
        LEAST_FOUR_BITS: 15,
        LEAST_FIVE_BITS: 31,
        CONTINUATION_BIT: 32,
        SIGN_BIT: 1,
    };
    function base64VlqEncode(integers) {
        return integers
            .map(vlqEncode)
            .map(base64Encode)
            .join('');
    }
    function vlqEncode(x) {
        if (x === 0) {
            return [0];
        }
        var absX = Math.abs(x);
        var sextets = [];
        while (absX > 0) {
            var sextet = 0;
            if (sextets.length === 0) {
                sextet = x < 0 ? 1 : 0; // set the sign bit
                sextet |= (absX & BIT_MASKS.LEAST_FOUR_BITS) << 1; // shift one ot make space for sign bit
                absX >>>= 4;
            }
            else {
                sextet = absX & BIT_MASKS.LEAST_FIVE_BITS;
                absX >>>= 5;
            }
            if (absX > 0) {
                sextet |= BIT_MASKS.CONTINUATION_BIT;
            }
            sextets.push(sextet);
        }
        return sextets;
    }
    function base64Encode(vlq) {
        return vlq.map(function (s) { return BASE64_ALPHABET[s]; }).join('');
    }
    function base64VlqDecode(base64Vlqs) {
        var vlqs = base64Decode(base64Vlqs);
        return splitVlqs(vlqs).map(vlqDecode);
    }
    function base64Decode(base64Vlqs) {
        return base64Vlqs.split('').map(function (c) {
            var sextet = REVERSE_BASE64_ALPHABET.get(c);
            if (sextet === undefined) {
                throw new Error(base64Vlqs + " is not a valid base64 encoded VLQ");
            }
            return sextet;
        });
    }
    function splitVlqs(vlqs) {
        var splitVlqs = [];
        var vlq = [];
        vlqs.forEach(function (sextet) {
            vlq.push(sextet);
            if ((sextet & BIT_MASKS.CONTINUATION_BIT) === 0) {
                splitVlqs.push(vlq);
                vlq = [];
            }
        });
        if (vlq.length > 0) {
            throw new Error('Malformed VLQ sequence: The last VlQ never ended.');
        }
        return splitVlqs;
    }
    function vlqDecode(vlq) {
        var x = 0;
        var isNegative = false;
        vlq.reverse().forEach(function (sextet, index) {
            if (index === vlq.length - 1) {
                isNegative = (sextet & BIT_MASKS.SIGN_BIT) === 1;
                sextet >>>= 1; // discard sign bit
                x <<= 4;
                x |= sextet & BIT_MASKS.LEAST_FOUR_BITS;
            }
            else {
                x <<= 5;
                x |= sextet & BIT_MASKS.LEAST_FIVE_BITS;
            }
        });
        return isNegative ? -x : x;
    }

    var Base64VlqCodecApp = /** @class */ (function () {
        function Base64VlqCodecApp(doc) {
            this.doc = doc;
            this.uiSelectors = {
                input: '#input',
                output: '#output',
                inputLabel: '#input-label',
                outputLabel: '#output-label',
                encodeDecodeButton: '#codec-button',
                swapEncodeDecodeButton: '#swap-encode-decode',
                inputErrorMessage: '#input-error',
            };
            this.uiText = {
                integersPlaceholder: 'Comma separated integers (e.g., 1, -2, 3)',
                encode: 'Encode',
                decode: 'Decode',
                base64VlqLabel: 'Base64 VLQs',
                integerLabel: 'Integers',
            };
            this.outputInverse = '';
            this.isEncoding = true;
            this.input = this.querySelectorOfType(this.uiSelectors.input, HTMLInputElement);
            this.output = this.querySelectorOfType(this.uiSelectors.output, HTMLInputElement);
            this.encodeDecodeButton = this.querySelectorOfType(this.uiSelectors.encodeDecodeButton, HTMLElement);
            this.swapEncodeDecodeButton = this.querySelectorOfType(this.uiSelectors.swapEncodeDecodeButton, HTMLElement);
            this.inputErrorMessage = this.querySelectorOfType(this.uiSelectors.inputErrorMessage, HTMLElement);
            this.inputLabel = this.querySelectorOfType(this.uiSelectors.inputLabel, HTMLElement);
            this.outputLabel = this.querySelectorOfType(this.uiSelectors.outputLabel, HTMLElement);
            this.setLabels();
            this.listenToEncodeDecodeButtonEvents();
            this.listenToSwapEncodeDecodeButtonEvents();
        }
        Base64VlqCodecApp.prototype.listenToEncodeDecodeButtonEvents = function () {
            var _this = this;
            this.encodeDecodeButton.addEventListener('click', function () {
                if (_this.isEncoding) {
                    _this.encode();
                }
                else {
                    _this.decode();
                }
            });
        };
        Base64VlqCodecApp.prototype.listenToSwapEncodeDecodeButtonEvents = function () {
            var _this = this;
            this.swapEncodeDecodeButton.addEventListener('click', function () {
                _this.isEncoding = !_this.isEncoding;
                _this.setLabels();
                var prevOutput = _this.output.value;
                _this.output.value = _this.outputInverse;
                _this.input.value = prevOutput;
                _this.outputInverse = prevOutput;
            });
        };
        Base64VlqCodecApp.prototype.setLabels = function () {
            this.setEncodedDecodeButton();
            this.setPlaceholderText();
            this.setInputOutputLabels();
        };
        Base64VlqCodecApp.prototype.setEncodedDecodeButton = function () {
            this.encodeDecodeButton.innerText = this.isEncoding
                ? this.uiText.encode
                : this.uiText.decode;
        };
        Base64VlqCodecApp.prototype.setPlaceholderText = function () {
            this.input.setAttribute('placeholder', this.isEncoding ? this.uiText.integersPlaceholder : '');
        };
        Base64VlqCodecApp.prototype.setInputOutputLabels = function () {
            this.inputLabel.innerText = this.isEncoding
                ? this.uiText.integerLabel
                : this.uiText.base64VlqLabel;
            this.outputLabel.innerText = this.isEncoding
                ? this.uiText.base64VlqLabel
                : this.uiText.integerLabel;
        };
        Base64VlqCodecApp.prototype.encode = function () {
            try {
                var nums = this.input.value
                    .split(',')
                    .map(function (s) { return s.trim(); })
                    .filter(function (s) { return s.length > 0; })
                    .map(function (s) {
                    var n = Number.parseInt(s, 10);
                    if (isNaN(n)) {
                        throw new Error("Invalid input: " + s + " is not a number");
                    }
                    return n;
                });
                this.output.value = base64VlqEncode(nums);
                this.clearInputErrorMessage();
                this.outputInverse = this.input.value;
            }
            catch (e) {
                this.setInputErrorMessage(e.message);
            }
        };
        Base64VlqCodecApp.prototype.decode = function () {
            try {
                var base64Vlqs = this.input.value;
                this.output.value = base64VlqDecode(base64Vlqs).join(', ');
            }
            catch (e) {
                this.setInputErrorMessage(e.message);
            }
        };
        Base64VlqCodecApp.prototype.setInputErrorMessage = function (message) {
            this.inputErrorMessage.innerText =
                message === undefined ? '' : "ERROR: " + message;
        };
        Base64VlqCodecApp.prototype.clearInputErrorMessage = function () {
            this.setInputErrorMessage(undefined);
        };
        Base64VlqCodecApp.prototype.querySelectorOfType = function (selector, type) {
            var element = this.doc.querySelector(selector);
            if (!element) {
                throw new Error("Could not find element with selector: " + selector);
            }
            if (!(element instanceof type)) {
                throw new Error("Element with selector " + selector + " is not of type " + type);
            }
            return element;
        };
        return Base64VlqCodecApp;
    }());
    window.addEventListener('load', function () {
        var app = new Base64VlqCodecApp(document);
    });

    exports.Base64VlqCodecApp = Base64VlqCodecApp;

    return exports;

}({}));
