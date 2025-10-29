/**
 * Component Tagger Loader
 *
 * This is a webpack/turbopack loader that can be used to add
 * data attributes to components for visual editing systems.
 *
 * Currently a no-op loader that passes content through unchanged.
 */

module.exports = function componentTaggerLoader(content) {
  // For now, just pass through the content unchanged
  // This can be extended later to add component tagging functionality
  return content;
};
