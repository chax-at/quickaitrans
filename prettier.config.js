module.exports = {
  singleAttributePerLine: true,
  singleQuote: true,
  trailingComma: "none",
  htmlWhitespaceSensitivity: "strict",
  overrides: [
    {
      files: '*.hbs',
      options: {
        parser: 'html'
      }
    }
  ]
}
