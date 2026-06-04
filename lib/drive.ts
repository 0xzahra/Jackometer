import { getAccessToken } from './firebase';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}

export const listDrivePdfs = async (): Promise<DriveFile[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google. Please sign in again.');
  }

  // q parameter to search only for PDFs
  const query = "mimeType='application/pdf' and trashed=false";
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webViewLink)&pageSize=20`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Drive API Error:', response.status, errorBody);
    throw new Error('Failed to fetch from Google Drive');
  }

  const data = await response.json();
  return data.files || [];
};
