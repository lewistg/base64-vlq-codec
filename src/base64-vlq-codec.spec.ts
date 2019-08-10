import {
  base64Encode,
  vlqEncode,
  base64VlqEncode,
  base64Decode,
  vlqDecode,
  splitVlqs,
  base64VlqDecode,
} from './base64-vlq-codec';

describe('base64Encode', () => {
  it('maps sextets to an assigned ASCII character in the base64 alphabet', () => {
    expect(base64Encode([0, 63, 23, 2, 5])).toEqual('A/XCF');
  });
});

describe('vlqEncode', () => {
  it('encodes number as a VLQ', () => {
    expect(vlqEncode(0b100_01010_1001)).toEqual([0b110010, 0b101010, 0b00100]);
    expect(vlqEncode(-0b100_01010_1001)).toEqual([0b110011, 0b101010, 0b00100]);
    expect(vlqEncode(0b0010_01001_00100_10010_01001_00100_1000)).toEqual([
      0b110000,
      0b100100,
      0b101001,
      0b110010,
      0b100100,
      0b101001,
      0b000010,
    ]);
  });
});

describe('base64VlqEncode', () => {
  it('encodes an array of numbers as a base64 VLQ', () => {
    expect(base64VlqEncode([1227133512, 8, -81])).toEqual('wkpykpCQjF');
  });
});

describe('base64VlqEncode', () => {
  it('encodes a sequence of zeroes as base64 VLQs properly', () => {
    expect(base64VlqEncode([0, 0, 0])).toEqual('AAA');
  });
});

describe('base64Decode', () => {
  it('maps base64 alphabet to their corresponding sextet values', () => {
    expect(base64Decode('A/XCF')).toEqual([0, 63, 23, 2, 5]);
  });
});

describe('vlqDecode', () => {
  it('maps base64 alphabet to their corresponding sextet values', () => {
    expect(
      vlqDecode([
        0b110000,
        0b100100,
        0b101001,
        0b110010,
        0b100100,
        0b101001,
        0b000010,
      ])
    ).toEqual(0b0010_01001_00100_10010_01001_00100_1000);
  });
});

describe('splitVlqs', () => {
  it('break up a list of VLQ sextets into individual VLQs', () => {
    expect(
      splitVlqs([
        0b100000,
        0b101000,
        0b100000,
        0b100010,
        0b110000,
        0b100000,
        0b000100,
        0b010000,
        0b100011,
        0b000101,
      ])
    ).toEqual([
      [0b100000, 0b101000, 0b100000, 0b100010, 0b110000, 0b100000, 0b000100],
      [0b010000],
      [0b100011, 0b000101],
    ]);
  });
});

describe('base64VlqDecode', () => {
  it('decode a base64 VLQ', () => {
    expect(base64VlqDecode('wkpykpCQjF')).toEqual([1227133512, 8, -81]);
  });
});
