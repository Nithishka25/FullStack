import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Question from '../models/Question.js';

dotenv.config();

const questions = [
  { text: 'What is your favorite cuisine?', type: 'single', options: ['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai'] },
  { text: 'How often do you eat out in a week?', type: 'single', options: ['Never', '1-2 times', '3-4 times', '5+ times'] },
  { text: 'Do you prefer spicy food?', type: 'single', options: ['Yes', 'No', 'Sometimes'] },
  { text: 'List your top three favorite fruits.', type: 'text' },
  { text: 'Which beverages do you usually consume?', type: 'multi', options: ['Water', 'Tea', 'Coffee', 'Juice', 'Soda'] },
  { text: 'Favorite type of bread?', type: 'single', options: ['Whole wheat', 'White', 'Sourdough', 'Multigrain', 'Gluten-free'] },
  { text: 'How do you like your steak cooked?', type: 'single', options: ['Rare', 'Medium-rare', 'Medium', 'Medium-well', 'Well-done', 'I don\'t eat steak'] },
  { text: 'Preferred breakfast foods', type: 'multi', options: ['Pancakes', 'Omelette', 'Cereal', 'Paratha', 'Smoothie', 'Toast'] },
  { text: 'Any food allergies?', type: 'text' },
  { text: 'Favorite dessert?', type: 'text' },
  { text: 'Pick your favorite pizza toppings', type: 'multi', options: ['Cheese', 'Pepperoni', 'Mushroom', 'Onion', 'Olives', 'Corn', 'Paneer'] },
  { text: 'How spicy do you like your curry?', type: 'single', options: ['Mild', 'Medium', 'Hot', 'Extra hot'] },
  { text: 'Do you prefer vegetarian, vegan, or non-vegetarian meals?', type: 'single', options: ['Vegetarian', 'Vegan', 'Non-vegetarian', 'No preference'] },
  { text: 'Favorite snack for the evening?', type: 'text' },
  { text: 'Select the grains you eat most often', type: 'multi', options: ['Rice', 'Wheat', 'Oats', 'Quinoa', 'Millets'] },
  { text: 'How many cups of coffee do you drink per day?', type: 'single', options: ['0', '1', '2', '3+'] },
  { text: 'Best way to cook vegetables?', type: 'single', options: ['Steamed', 'Sauteed', 'Roasted', 'Raw', 'Curried'] },
  { text: 'Favorite regional Indian cuisine?', type: 'single', options: ['North Indian', 'South Indian', 'East Indian', 'West Indian', 'North-East Indian'] },
  { text: 'What is your comfort food?', type: 'text' },
  { text: 'Choose your favorite types of noodles', type: 'multi', options: ['Ramen', 'Udon', 'Soba', 'Hakka', 'Rice noodles', 'Pasta'] },
  { text: 'How often do you try new recipes?', type: 'single', options: ['Rarely', 'Sometimes', 'Often', 'Very often'] }
];

const run = async () => {
  await connectDB();
  for (const q of questions) {
    await Question.updateOne(
      { text: q.text },
      { $set: { ...q, isActive: true } },
      { upsert: true }
    );
  }
  console.log(`Seeded/updated ${questions.length} questions.`);
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
