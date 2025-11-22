/* eslint-disable @typescript-eslint/no-require-imports */
const React = require('react');

const NextImage = ({ src, alt, width, height, className, style }) => {
  // Render a standard <img> that Jest + RTL can understand
  return React.createElement('img', { src, alt, width, height, className, style });
};

module.exports = NextImage;
