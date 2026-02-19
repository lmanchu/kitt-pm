const fs = require('fs');
const path = require('path');

const skills = new Map();

function registerSkill(name, handler) {
  skills.set(name, handler);
}

function getSkill(name) {
  return skills.get(name);
}

function loadSkills(app) {
  const skillsDir = __dirname;
  const skillFolders = fs.readdirSync(skillsDir).filter(f =>
    fs.statSync(path.join(skillsDir, f)).isDirectory());

  for (const folder of skillFolders) {
    const skillPath = path.join(skillsDir, folder, 'index.js');
    if (fs.existsSync(skillPath)) {
      try {
        const skill = require(skillPath);
        if (skill.name && skill.register) {
          skill.register(app);
          registerSkill(skill.name, skill);
          console.log(`Skill loaded: ${skill.name}`);
        }
      } catch (e) {
        console.error(`Error loading skill ${folder}:`, e);
      }
    }
  }
}

module.exports = {
  registerSkill,
  getSkill,
  loadSkills,
};
