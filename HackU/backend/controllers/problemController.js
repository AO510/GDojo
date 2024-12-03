const problems = {
  "IT": ["Design a scalable database", "Implement a machine learning model"],
  "Finance": ["Optimize a portfolio", "Create a risk assessment model"],
  "Marketing": ["Plan a social media campaign", "Analyze market trends"],
};

const getProblemsByCategory = (req, res) => {
  const { category } = req.params;
  const problemList = problems[category];

  if (!problemList) {
    return res.status(404).json({ message: `No problems found for category: ${category}` });
  }

  return res.status(200).json({ category, problems: problemList });
};

module.exports = {
  getProblemsByCategory,
};
