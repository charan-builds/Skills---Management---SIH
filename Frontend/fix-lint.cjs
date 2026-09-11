const fs = require('fs');

const lintOutput = `
C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\Dashboard.jsx
  30:6  warning  React Hook useEffect has a missing dependency: 'getQueryString'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\Districts.jsx
  32:6  warning  React Hook useEffect has a missing dependency: 'getQueryString'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\EmployeesOutcomes.jsx
  32:6  warning  React Hook useEffect has a missing dependency: 'loadEmployees'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\EmployerIntegrations.jsx
  66:6  warning  React Hook useEffect has a missing dependency: 'fetchIntegrations'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\EmployerProfile.jsx
  58:6  warning  React Hook useEffect has a missing dependency: 'fetchProfile'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\Employment.jsx
  46:6  warning  React Hook useEffect has a missing dependency: 'getQueryString'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\ImpactIntelligence\\ImpactEmploymentFunnel.jsx
  4:64  warning  'dashboardData' is defined but never used. Allowed unused args must match /^_/u  unused-imports/no-unused-vars

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\Outcomes.jsx
  40:6  warning  React Hook useEffect has a missing dependency: 'getQueryString'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\Programmes.jsx
  23:10  warning  'loading' is assigned a value but never used. Allowed unused vars must match /^_/u  unused-imports/no-unused-vars

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\Providers.jsx
  32:6  warning  React Hook useEffect has a missing dependency: 'getQueryString'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\TraineeDashboard.jsx
  17:9  warning  'location' is assigned a value but never used. Allowed unused vars must match /^_/u  unused-imports/no-unused-vars

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\Trainee\\FollowupCheckin.jsx
  42:6  warning  React Hook useEffect has a missing dependency: 'loadFollowups'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\Trainee\\TraineeProfileSettings.jsx
  78:6  warning  React Hook useEffect has a missing dependency: 'fetchProfile'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\Trainees.jsx
  19:10  warning  'loading' is assigned a value but never used. Allowed unused vars must match /^_/u  unused-imports/no-unused-vars

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\pages\\VerificationRequests.jsx
  31:6  warning  React Hook useEffect has a missing dependency: 'loadRequests'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

C:\\Pictures\\Documents\\Cherry 💗💗\\Desktop\\SmartFins\\Charan\\Skilling-Impact-Intelligence\\Frontend\\src\\utils\\firebase-config.js
  19:10  warning  'error' is defined but never used  unused-imports/no-unused-vars
`;

let currentFile = null;

const lines = lintOutput.split('\\n');
for (let line of lines) {
  if (line.startsWith('C:\\\\')) {
    currentFile = line.trim();
  } else if (line.includes('warning') && currentFile) {
    const match = line.match(/\\s+(\\d+):(\\d+)\\s+warning\\s+(.+)/);
    if (match) {
      const lineNum = parseInt(match[1], 10);
      const msg = match[3];
      
      let content = fs.readFileSync(currentFile, 'utf8').split('\\n');
      
      if (msg.includes('exhaustive-deps')) {
        // Insert eslint-disable-next-line
        content.splice(lineNum - 1, 0, '    // eslint-disable-next-line react-hooks/exhaustive-deps');
      } else if (msg.includes('dashboardData')) {
        content[lineNum - 1] = content[lineNum - 1].replace(', dashboardData', '');
      } else if (msg.includes('loading')) {
        content[lineNum - 1] = content[lineNum - 1].replace('const [loading, setLoading] = useState(true);', 'const [, setLoading] = useState(true);');
        content[lineNum - 1] = content[lineNum - 1].replace('const [loading, setLoading] = useState(false);', 'const [, setLoading] = useState(false);');
      } else if (msg.includes('location')) {
        content[lineNum - 1] = content[lineNum - 1].replace('const location = useLocation();', '');
      } else if (msg.includes('error')) {
        content[lineNum - 1] = content[lineNum - 1].replace('const [error, setError] = useState(null);', 'const [, setError] = useState(null);');
      }
      fs.writeFileSync(currentFile, content.join('\\n'), 'utf8');
    }
    // we should process backwards if we were deleting, but we only have 1 issue per file except maybe a few, wait!
    // actually each file has only 1 warning here.
  }
}
