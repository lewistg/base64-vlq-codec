import * as Base64VlqCodec from '@lewistg/base64-vlq-codec';

export class Base64VlqCodecApp {
  private readonly uiSelectors = {
    input: '#input',
    output: '#output',
    inputLabel: '#input-label',
    outputLabel: '#output-label',
    encodeDecodeButton: '#codec-button',
    swapEncodeDecodeButton: '#swap-encode-decode',
    inputErrorMessage: '#input-error',
  };
  private readonly uiText = {
    integersPlaceholder: 'Comma separated integers (e.g., 1, -2, 3)',
    encode: 'Encode',
    decode: 'Decode',
    base64VlqLabel: 'Base64 VLQs',
    integerLabel: 'Integers',
  };
  private input: HTMLInputElement;
  private output: HTMLInputElement;
  private outputInverse = '';
  private encodeDecodeButton: HTMLElement;
  private swapEncodeDecodeButton: HTMLElement;
  private inputLabel: HTMLElement;
  private outputLabel: HTMLElement;
  private inputErrorMessage: HTMLElement;
  private isEncoding = true;

  constructor(private doc: Document) {
    this.input = this.querySelectorOfType(
      this.uiSelectors.input,
      HTMLInputElement
    );
    this.output = this.querySelectorOfType(
      this.uiSelectors.output,
      HTMLInputElement
    );
    this.encodeDecodeButton = this.querySelectorOfType(
      this.uiSelectors.encodeDecodeButton,
      HTMLElement
    );
    this.swapEncodeDecodeButton = this.querySelectorOfType(
      this.uiSelectors.swapEncodeDecodeButton,
      HTMLElement
    );
    this.inputErrorMessage = this.querySelectorOfType(
      this.uiSelectors.inputErrorMessage,
      HTMLElement
    );
    this.inputLabel = this.querySelectorOfType(
      this.uiSelectors.inputLabel,
      HTMLElement
    );
    this.outputLabel = this.querySelectorOfType(
      this.uiSelectors.outputLabel,
      HTMLElement
    );
    this.setLabels();
    this.listenToEncodeDecodeButtonEvents();
    this.listenToSwapEncodeDecodeButtonEvents();
  }

  private listenToEncodeDecodeButtonEvents() {
    this.encodeDecodeButton.addEventListener('click', () => {
      if (this.isEncoding) {
        this.encode();
      } else {
        this.decode();
      }
    });
  }

  private listenToSwapEncodeDecodeButtonEvents() {
    this.swapEncodeDecodeButton.addEventListener('click', () => {
      this.isEncoding = !this.isEncoding;
      this.setLabels();

      const prevOutput = this.output.value;
      this.output.value = this.outputInverse;
      this.input.value = prevOutput;
      this.outputInverse = prevOutput;
    });
  }

  private setLabels() {
    this.setEncodedDecodeButton();
    this.setPlaceholderText();
    this.setInputOutputLabels();
  }

  private setEncodedDecodeButton() {
    this.encodeDecodeButton.innerText = this.isEncoding
      ? this.uiText.encode
      : this.uiText.decode;
  }

  private setPlaceholderText() {
    this.input.setAttribute(
      'placeholder',
      this.isEncoding ? this.uiText.integersPlaceholder : ''
    );
  }

  private setInputOutputLabels() {
    this.inputLabel.innerText = this.isEncoding
      ? this.uiText.integerLabel
      : this.uiText.base64VlqLabel;
    this.outputLabel.innerText = this.isEncoding
      ? this.uiText.base64VlqLabel
      : this.uiText.integerLabel;
  }

  private encode() {
    try {
      const nums = this.input.value
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => {
          const n = Number.parseInt(s, 10);
          if (isNaN(n)) {
            throw new Error(`Invalid input: ${s} is not a number`);
          }
          return n;
        });
      this.output.value = Base64VlqCodec.base64VlqEncode(nums);
      this.clearInputErrorMessage();
      this.outputInverse = this.input.value;
    } catch (e) {
      this.setInputErrorMessage(e.message);
    }
  }

  private decode() {
    try {
      const base64Vlqs = this.input.value;
      this.output.value = Base64VlqCodec.base64VlqDecode(base64Vlqs).join(', ');
    } catch (e) {
      this.setInputErrorMessage(e.message);
    }
  }

  private setInputErrorMessage(message: string | undefined) {
    this.inputErrorMessage.innerText =
      message === undefined ? '' : `ERROR: ${message}`;
  }

  private clearInputErrorMessage() {
    this.setInputErrorMessage(undefined);
  }

  private querySelectorOfType<T extends HTMLElement>(
    selector: string,
    type: new () => T
  ): T {
    const element = this.doc.querySelector(selector);
    if (!element) {
      throw new Error(`Could not find element with selector: ${selector}`);
    }
    if (!(element instanceof type)) {
      throw new Error(
        `Element with selector ${selector} is not of type ${type}`
      );
    }
    return element;
  }
}

window.addEventListener('load', () => {
  const app = new Base64VlqCodecApp(document);
});
