# Base64 VLQ Codec

This is a minimalist library for decoding and encoding base64 VLQs. This
repository is also a companion to this [blog
post](https://www.lucidchart.com/techblog/2019/08/22/decode-encoding-base64-vlqs-source-maps/), which also explains base64 VLQs.

## Usage

In TypeScript:

```TypeScript
import {base64VlqEncode, base64VlqDecode} from '@lewistg/base64-vlq-codec';

base64VlqEncode([1776, -2387, 2121809, 8, 1820, -8121988]); // 'gvDn1EilwhEQ4xDpo3vP'

base64VlqDecode('uDt7D0TkuK'); // [55, -1974, 314, 5346]
```

## Installation

```
$ npm install --save-dev '@lewistg/base64-vlq-codec'
```
