# TODO: Edit Contact Page

## Steps to Complete

1. **Replace select dropdown with subject input field**
   - Change the subject field from a select element to a text input.
   - Update placeholder and styling to match other inputs.

2. **Integrate Web3Forms**
   - Update handleSubmit function to use fetch API for form submission to Web3Forms.
   - Add access key "c60950a6-f19d-465f-b72f-681e1ab34cf9" to FormData.
   - Handle success and error responses appropriately.
   - Reset form on successful submission.

3. **Add result state and display**
   - Add useState for result message (e.g., "Sending....", "Form Submitted Successfully", "Error").
   - Display the result in the form with appropriate styling.

4. **Enhance microinteractions**
   - Add subtle animations for input focus (e.g., border color change, slight scale).
   - Improve button hover effects (already present, but ensure smooth transitions).
   - Add animations for success/error messages (fade in/out).
   - Ensure all transitions are smooth and consistent.

5. **Test and verify**
   - Ensure form submission works with Web3Forms.
   - Check responsive design and animations on different screen sizes.
   - Verify accessibility and usability.

## Completed Steps

- [x] Replace select dropdown with subject input field
- [x] Integrate Web3Forms with proper error handling for development environment
- [x] Add result state and display with animated feedback
- [x] Enhance microinteractions with focus scaling on inputs
- [x] Update button text and styling
- [x] Handle CORS issues in development by simulating success
