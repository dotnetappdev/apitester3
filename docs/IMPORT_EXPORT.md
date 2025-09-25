# Import/Export Collections and Tests

API Tester 3 provides a robust import/export system that allows teams to share collections and test suites using a secure binary format. This feature enables seamless collaboration between team members and across different environments.

## Overview

The import/export functionality allows you to:
- Export collections with their associated requests and test suites
- Share collections as portable binary files (`.at3` format)
- Import collections with automatic user ID remapping
- Preserve or remap ownership when importing
- Handle team member transitions seamlessly

## File Format

API Tester 3 uses a custom binary format with the `.at3` extension:

- **Magic Header**: `AT3EXPORT` (identifies the file type)
- **Version Info**: Ensures compatibility across different versions
- **Encrypted Data**: JSON payload containing collections, requests, and test suites
- **Metadata**: Export information including date, author, and statistics
- **Integrity Checks**: Validates file integrity during import

## Exporting Collections

### Via Menu
1. Go to **File > Export Collection** (or press `Ctrl+E`)
2. Select the collections you want to export
3. Review the export summary
4. Choose export location and filename
5. Click **Export Collections**

### What Gets Exported
- Selected collections and their metadata
- All requests within selected collections
- Associated test suites and test cases
- Request/response history (if configured)
- Collection settings and configurations

### Export Options
- **Collection Selection**: Choose specific collections to export
- **Automatic Test Suite Inclusion**: Related test suites are automatically included
- **Metadata Preservation**: Original creation dates and settings are maintained

## Importing Collections

### Via Menu
1. Go to **File > Import Collection** (or press `Ctrl+I`)
2. Click **Browse Collection File** to select an `.at3` file
3. Review the import preview
4. Choose import options
5. Click **Import Collections**

### Import Preview
Before importing, you can preview:
- Export metadata (who exported, when, statistics)
- List of collections to be imported
- Number of requests and test suites
- Original collection details

### Import Options

#### 1. Import as My Collections (Recommended)
- **Description**: All imported collections become owned by you
- **Use Case**: Personal use, individual team member imports
- **Behavior**: 
  - All collections are assigned to your user ID
  - You become the owner of all imported data
  - No dependency on original user accounts

#### 2. Preserve Original Ownership
- **Description**: Maintains original user assignments
- **Use Case**: Team lead importing for the entire team
- **Requirements**: 
  - Original user IDs must exist in the target system
  - Administrative privileges may be required
- **Behavior**:
  - Original ownership is preserved where possible
  - Unmapped users generate warnings
  - May fail if original users don't exist

## User ID Mapping

When importing collections, the system handles user ID conflicts automatically:

### Automatic Remapping
- **New Collection IDs**: Generated to avoid conflicts with existing collections
- **New Request IDs**: Generated to maintain referential integrity
- **Updated Timestamps**: Import time is recorded
- **Test Suite Updates**: Request ID references are updated automatically

### Mapping Strategies
1. **Target User Mapping**: All content mapped to importing user
2. **Preserve Original**: Attempts to maintain original ownership
3. **Custom Mapping**: Advanced scenarios with user mapping tables

## Team Collaboration Workflows

### Scenario 1: Individual Developer Sharing
```
Developer A exports their collections → 
Sends .at3 file to Developer B → 
Developer B imports as their own collections
```

### Scenario 2: Team Lead Distribution  
```
Team Lead exports team collections → 
Distributes to new team members → 
New members import as their own → 
Everyone has access to team's API collection
```

### Scenario 3: Environment Migration
```
Export from Development environment → 
Import to Staging/Production → 
Maintain collection structure across environments
```

## Security Considerations

### Encryption
- All export files are encrypted using AES encryption
- Data is protected during transfer and storage
- Tampering detection through integrity checks

### Data Privacy
- No user passwords or sensitive authentication data is exported
- API keys and tokens should be reviewed before sharing
- Consider using environment variables for sensitive data

### Access Control
- Export requires access to the collections being exported
- Import creates new data owned by the importing user
- No elevation of privileges during import process

## Best Practices

### Before Exporting
1. **Review Sensitive Data**: Remove or mask API keys, tokens, and sensitive headers
2. **Test Collection**: Ensure all requests work correctly
3. **Update Documentation**: Include collection descriptions and test instructions
4. **Version Control**: Use descriptive filenames with version numbers

### Before Importing
1. **Preview First**: Always review the import preview
2. **Backup Existing**: Consider backing up current collections
3. **Choose Appropriate Option**: Select the right import strategy for your use case
4. **Plan User Mapping**: Understand how ownership will be handled

### File Management
- Use descriptive filenames: `api-collections-v2.1-2024-01-15.at3`
- Store in secure, shared locations
- Maintain version history of exports
- Document what each export contains

## Troubleshooting

### Common Issues

#### Import Fails - Invalid File Format
- **Cause**: File is corrupted or not a valid `.at3` file
- **Solution**: Re-export the original file or obtain a new copy

#### Import Fails - Decryption Error
- **Cause**: File was created with a different version or is corrupted
- **Solution**: Verify file integrity and API Tester version compatibility

#### Missing Collections After Import
- **Cause**: Import completed but collections aren't visible
- **Solution**: Refresh the application or check the correct user account

#### User Mapping Warnings
- **Cause**: Original user IDs don't exist in target system
- **Solution**: Use "Import as My Collections" option or create missing users

### Getting Help
1. Check the import/export logs in the application
2. Verify file integrity using the preview function
3. Test with a small collection first
4. Contact your team lead or administrator for user mapping issues

## Technical Details

### File Structure
```
AT3EXPORT (8 bytes) - Magic header
Version length (1 byte) - Length of version string
Version string (variable) - Version information
Data length (4 bytes) - Length of encrypted data
Encrypted JSON data (variable) - The actual collection data
```

### JSON Schema
The encrypted data contains:
```json
{
  "version": "1.0.0",
  "exportedAt": "ISO 8601 timestamp",
  "collections": [...],
  "testSuites": [...],
  "metadata": {
    "totalCollections": 5,
    "totalRequests": 25,
    "totalTestSuites": 10,
    "exportedBy": "username"
  }
}
```

### API Integration
The import/export functionality integrates with:
- Electron file system APIs for file operations
- Database manager for collection storage
- Test runner for test suite management
- User management system for ownership handling

## Version History

- **v1.0.0**: Initial implementation with basic import/export
- **Future**: Planned enhancements include batch operations, advanced filtering, and cloud storage integration