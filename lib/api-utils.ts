import { NextRequest } from 'next/server';

/**
 * Extract the ID from the URL path
 * @param request - NextRequest object
 * @returns The ID from the URL path or null if not found
 */
export function extractIdFromUrl(request: NextRequest): string | null {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    // Basic validation to ensure it's not empty and looks like an ID
    if (!id || id.length === 0) {
      return null;
    }
    
    return id;
  } catch (error) {
    console.error('Error extracting ID from URL:', error);
    return null;
  }
}

/**
 * Validate MongoDB ObjectId format
 * @param id - ID string to validate
 * @returns true if valid ObjectId format, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  // MongoDB ObjectId is 24 characters long and contains only hexadecimal characters
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

/**
 * Extract and validate ID from URL
 * @param request - NextRequest object
 * @returns Object with id and validation status
 */
export function extractAndValidateId(request: NextRequest): { id: string | null; isValid: boolean } {
  const id = extractIdFromUrl(request);
  
  if (!id) {
    return { id: null, isValid: false };
  }
  
  const isValid = isValidObjectId(id);
  return { id, isValid };
}
