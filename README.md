# Quiz Generator by Importing CSV

The Quiz Generator allows you to randomly create quizzes by importing a CSV file containing a question bank. The CSV must have the following header row:

- **Quiz Title**
- **HTML of the Question**
- **Answer**
- **Options** (separated by `|`)
- **HTML of the Explanation to the Answer**
- **Question Type**

### Question Types

The _Question Type_ can be one of the following:

- **mc14**: Choose 1 out of 4 multiple choices

For the HTML of the questions or the explanation, you may simply fill in with the text or with HTML elements, like table or img. Make sure your images could be found online.

### How to Use

1. **Download the Template CSV (Optional)**  
   If you're starting from scratch or don't have a CSV file ready, you can download the template CSV with basic Math and English questions by clicking on the _Download Template_ button.

2. **Upload a CSV File**

   - Upload your own CSV file containing questions.
   - Ensure the file adheres to the required CSV format: Quiz Title, Question HTML, Answer, Options, Explanation, and Question Type.

3. **Analyze the CSV**

   - After uploading the CSV, click the _Analyse_ button to validate and extract questions.
   - A list of quiz titles from the CSV will be displayed. Select the quiz titles you want to include in the quiz by checking the box next to each title.
   - The questions under the selected quiz titles will be shown.

4. **Adjust Settings (Optional)**

   - You can customize the number of questions to include in the quiz using a range slider.
   - Choose whether to shuffle the questions and the answer options.
   - Toggle whether to show the answer and explanation after each question.

5. **Generate Quiz**  
   Once you're happy with your settings, click on the _Apply & Start Quiz_ button to generate your quiz.

6. **Take the Quiz**  
   You will be redirected to the quiz interface where you can answer the questions and view explanations if enabled.

### Example CSV Format

Here's an example of what your CSV file should look like:

| Quiz Title   | HTML of the Question                         | Answer | Options | HTML of the Explanation | Question Type |
| ------------ | -------------------------------------------- | ------ | ------- | ----------------------- | ------------- | --- | ------------------------------------------------------------------ | ---- |
| Math Quiz    | `<p>What is 2 + 2?</p>`                      | A      | 3       | 4                       | 5             | 6   | `<p>The correct answer is 4 because 2 + 2 equals 4.</p>`           | mc14 |
| Science Quiz | `<p>What is the boiling point of water?</p>` | B      | 100     | 90                      | 120           | 80  | `<p>Water boils at 100°C under standard atmospheric pressure.</p>` | mc14 |

### Additional Features

- You can try a basic Math and English quiz template for quick testing.
- Customize the quiz generation settings like the number of questions, whether to shuffle answers, and if explanations should be displayed.
