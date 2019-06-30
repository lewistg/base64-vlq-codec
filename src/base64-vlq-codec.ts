const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const REVERSE_BASE64_ALPHABET: Map<string, number> = (() => {
  const characterIndexPairs = BASE64_ALPHABET.split('').map<[string, number]>(
    (c: string, i: number) => [c, i]
  );
  return new Map<string, number>(characterIndexPairs);
})();

const BIT_MASKS = {
  LEAST_FOUR_BITS: 0b1111,
  LEAST_FIVE_BITS: 0b11111,
  CONTINUATION_BIT: 0b100000,
  SIGN_BIT: 0b1,
};

export function base64VlqEncode(integers: number[]): string {
  return integers
    .map(vlqEncode)
    .map(base64Encode)
    .join('');
}

export function vlqEncode(x: number): number[] {
  let absX = Math.abs(x);
  const sextets: number[] = [];
  while (absX > 0) {
    let sextet = 0;
    if (sextets.length === 0) {
      sextet = x < 0 ? 1 : 0; // set the sign bit
      sextet |= (absX & BIT_MASKS.LEAST_FOUR_BITS) << 1; // shift one ot make space for sign bit
      absX >>>= 4;
    } else {
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

export function base64Encode(vlq: number[]): string {
  return vlq.map(s => BASE64_ALPHABET[s]).join('');
}

export function base64VlqDecode(base64Vlqs: string): number[] {
  const vlqs: number[] = base64Decode(base64Vlqs);
  return splitVlqs(vlqs).map(vlqDecode);
}

export function base64Decode(base64Vlqs: string): number[] {
  return base64Vlqs.split('').map(c => {
    const sextet = REVERSE_BASE64_ALPHABET.get(c);
    if (sextet === undefined) {
      throw new Error(`${base64Vlqs} is not a valid base64 encoded VLQ`);
    }
    return sextet;
  });
}

export function splitVlqs(vlqs: number[]): number[][] {
  const splitVlqs: number[][] = [];
  let vlq: number[] = [];
  vlqs.forEach((sextet: number) => {
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

export function vlqDecode(vlq: number[]): number {
  let x = 0;
  let isNegative = false;
  vlq.reverse().forEach((sextet: number, index: number) => {
    if (index === vlq.length - 1) {
      isNegative = (sextet & BIT_MASKS.SIGN_BIT) === 1;
      sextet >>>= 1; // discard sign bit
      x <<= 4;
      x |= sextet & BIT_MASKS.LEAST_FOUR_BITS;
    } else {
      x <<= 5;
      x |= sextet & BIT_MASKS.LEAST_FIVE_BITS;
    }
  });
  return isNegative ? -x : x;
}
