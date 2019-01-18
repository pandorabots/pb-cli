function onRemove() {
  if (this.program.args[1]) {
    this.util.removePerf(this.program.args[1]);
  } else {
    console.log('usage: remove <filename>');
  }
}

module.exports = onRemove
