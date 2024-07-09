// src/app/api/execute/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
    try {
        const { code } = await request.json();
        console.log('Received code:', code);

        // Judge0 API URL and headers
        const judge0Url = 'https://judge0.p.rapidapi.com/submissions';
        const judge0Headers = {
            'Content-Type': 'application/json',
            'X-RapidAPI-Host': 'judge0.p.rapidapi.com',
            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
        };

        // Submit code to Judge0
        const submissionResponse = await axios.post(judge0Url, {
            source_code: code,
            language_id: 63, // JavaScript (Node.js)
        }, { headers: judge0Headers });

        console.log('Submission response:', submissionResponse.data);

        // Poll for result
        const submissionToken = submissionResponse.data.token;
        let result;
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds
            result = await axios.get(`${judge0Url}/${submissionToken}`, {
                headers: judge0Headers,
            });
            console.log('Poll attempt:', i, 'Result:', result.data);
            if (result.data.status.id === 3) break; // status 3 means completed
        }

        return NextResponse.json({ output: result.data.stdout || result.data.stderr });
    } catch (error) {
        console.error('Error executing code:', error);
        return NextResponse.json({ output: 'Error executing code' }, { status: 500 });
    }
}
