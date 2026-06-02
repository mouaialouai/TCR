import * as fs from 'fs';

const path = 'src/App.tsx';
let txt = fs.readFileSync(path, 'utf8');
const lines = txt.split('\n');

let found = false;
for (let i = 0; i < lines.length - 1; i++) {
  // Let's look for the closing of save.userNotes or other content, and the first occurrence of line i ending with </div> and i+1 being )}
  if (lines[i].trim() === '</div>' && lines[i+1].trim() === ')}') {
    // Make sure we find the one under activeTab === 'history' tab (usually after line 4000)
    if (i > 4000) {
      console.log(`FOUND TARGET AT INDEX ${i}:`);
      console.log('i-1:', JSON.stringify(lines[i-1]));
      console.log('i  :', JSON.stringify(lines[i]));
      console.log('i+1:', JSON.stringify(lines[i+1]));
      console.log('i+2:', JSON.stringify(lines[i+2]));

      // Do the injection
      lines[i+1] = '                          ))}';
      lines.splice(i+2, 0, '                        </div>', '                     )}');
      found = true;
      break;
    }
  }
}

if (found) {
  fs.writeFileSync(path, lines.join('\n'), 'utf8');
  console.log('REPLACEMENT DONE DYNAMICALLY!');
} else {
  console.log('PATTERN NOT FOUND DYNAMICALLY!');
}
