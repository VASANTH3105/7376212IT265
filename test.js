

const express = require('express');
const axios = require('axios'); 
const lodash = require('lodash'); 

const app = express();
const windowSize = 10; 
const timeout = 500; 

let storedNumbers = []; 

const isValidId = (id) => ['p', 'f', 'e', 'r'].includes(id);

const calculateAverage = (numbers) => lodash.mean(numbers) || 0; 


app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;

  if (!isValidId(numberid)) {
    return res.status(400).json({ message: 'Invalid number ID' });
  }

  try {
    const response = await axios.get(`http://20.244.56.144/numbers/${numberid}`, { timeout }); 

    const fetchedNumber = response.data;
    //not in case of success or timeout form API provided by affordmed
    if (response.status !== 200 || response.elapsedTime > timeout) {
      return res.json({ windowPrevState: storedNumbers, windowCurrState: storedNumbers, numbers: [], avg: calculateAverage(storedNumbers) });
    }

    const uniqueNumber = lodash.uniq([...storedNumbers, fetchedNumber]).slice(-windowSize);

    storedNumbers = uniqueNumber;

    const windowPrevState = storedNumbers.slice(0, -1); 
    const windowCurrState = storedNumbers; 

    res.json({
      windowPrevState,
      windowCurrState,
      numbers: [fetchedNumber], // Only include the latest number
      avg: calculateAverage(windowCurrState)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
