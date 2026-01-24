// google.cloud.service.js  
const { Storage } = require('@google-cloud/storage');  
const { PubSub } = require('@google-cloud/pubsub');  
const { BigQuery } = require('@google-cloud/bigquery');  
const { Compute } = require('@google-cloud/compute');  
const { CloudFunctionsServiceClient } = require('@google-cloud/functions');  
const { Firestore } = require('@google-cloud/firestore');  
const path = require('path');  

/**   CLAUDE 3.7 Sonnet - Update your class to handle Firestore properly.
 * GoogleCloudService - A class to interact with various Google Cloud services  
 */  
class GoogleCloudService {  
  /**  
   * Initialize the Google Cloud service  
   * @param {Object} config - Configuration object  
   * @param {string} config.projectId - Google Cloud Project ID  
   * @param {string} config.keyFilename - Path to service account key file (optional)  
   * @param {Object} config.credentials - Credentials object (optional)  
   */  
  constructor(config = {}) {  
    // Get projectId from config or environment variable  
    this.projectId = config.projectId || process.env.GOOGLE_CLOUD_PROJECT_ID;  
    
    // Validate projectId  
    if (!this.projectId || typeof this.projectId !== 'string') {  
      throw new Error('A valid projectId string must be provided either in config or via GOOGLE_CLOUD_PROJECT_ID environment variable');  
    }  
    
    // Get other configuration options  
    this.keyFilename = config.keyFilename || process.env.GOOGLE_APPLICATION_CREDENTIALS;  
    this.credentials = config.credentials;  
    
    // Initialize core services  
    this.storage = null;  
    this.pubsub = null;  
    this.bigquery = null;  
    this.computeEngine = null;  
    this.functions = null;  
    this.firestore = null;  
    
    this._initializeServices();  
  } 
  
  /**  
   * Initialize all Google Cloud services  
   * @private  
   */  
  _initializeServices() {  
    const authConfig = {  
      projectId: this.projectId  
    };  
    
    if (this.keyFilename) {  
      authConfig.keyFilename = this.keyFilename;  
    } else if (this.credentials) {  
      authConfig.credentials = this.credentials;  
    }  
    
    // Initialize Firestore  
    this.firestore = new Firestore(authConfig);  
    
    // Initialize Storage  
    this.storage = new Storage(authConfig);  
    
    // Initialize Pub/Sub  
    this.pubsub = new PubSub(authConfig);  
    
    // Initialize BigQuery  
    this.bigquery = new BigQuery(authConfig);  
    
    // Initialize Compute Engine  
    this.computeEngine = new Compute(authConfig);  
    
    // Initialize Cloud Functions  
    this.functions = new CloudFunctionsServiceClient(authConfig);  
    
    console.log(`Initialized Google Cloud services for project: ${this.projectId}`);  
  }  
  
  // ===== FIRESTORE METHODS =====  
  
  /**  
   * Get a document from Firestore  
   * @param {string} collection - Collection name  
   * @param {string} docId - Document ID  
   * @returns {Promise<Object>} - Document data  
   */  
  async getDocument(collection, docId) {  
    try {  
      const docRef = this.firestore.collection(collection).doc(docId);  
      const doc = await docRef.get();  
      
      if (!doc.exists) {  
        console.log(`Document ${docId} does not exist in ${collection}`);  
        return null;  
      }  
      
      console.log(`Retrieved document ${docId} from ${collection}`);  
      return doc.data();  
    } catch (error) {  
      console.error('Get document failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * Add a document to Firestore  
   * @param {string} collection - Collection name  
   * @param {Object} data - Document data  
   * @param {string} docId - Document ID (optional)  
   * @returns {Promise<Object>} - Reference to the new document  
   */  
  async addDocument(collection, data, docId = null) {  
    try {  
      let docRef;  
      let result;  
      
      if (docId) {  
        docRef = this.firestore.collection(collection).doc(docId);  
        await docRef.set(data);  
        result = docRef;  
      } else {  
        result = await this.firestore.collection(collection).add(data);  
        docRef = result;  
      }  
      
      console.log(`Added document ${docRef.id} to ${collection}`);  
      return result;  
    } catch (error) {  
      console.error('Add document failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * Update a document in Firestore  
   * @param {string} collection - Collection name  
   * @param {string} docId - Document ID  
   * @param {Object} data - Updated fields  
   * @returns {Promise<void>}  
   */  
  async updateDocument(collection, docId, data) {  
    try {  
      const docRef = this.firestore.collection(collection).doc(docId);  
      await docRef.update(data);  
      
      console.log(`Updated document ${docId} in ${collection}`);  
    } catch (error) {  
      console.error('Update document failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * Delete a document from Firestore  
   * @param {string} collection - Collection name  
   * @param {string} docId - Document ID  
   * @returns {Promise<void>}  
   */  
  async deleteDocument(collection, docId) {  
    try {  
      const docRef = this.firestore.collection(collection).doc(docId);  
      await docRef.delete();  
      
      console.log(`Deleted document ${docId} from ${collection}`);  
    } catch (error) {  
      console.error('Delete document failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * Query documents from Firestore  
   * @param {string} collection - Collection name  
   * @param {Array} queries - Array of query conditions [field, operator, value]  
   * @returns {Promise<Array>} - Matching documents  
   */  
  async queryDocuments(collection, queries = []) {  
    try {  
      let query = this.firestore.collection(collection);  
      
      // Add query conditions  
      for (const [field, operator, value] of queries) {  
        query = query.where(field, operator, value);  
      }  
      
      const snapshot = await query.get();  
      const results = [];  
      
      snapshot.forEach(doc => {  
        results.push({  
          id: doc.id,  
          ...doc.data()  
        });  
      });  
      
      console.log(`Query returned ${results.length} documents from ${collection}`);  
      return results;  
    } catch (error) {  
      console.error('Query documents failed:', error);  
      throw error;  
    }  
  }  
  
  // ... Other methods from the previous example ...  
}  

// Export the class  
module.exports = GoogleCloudService;