// Import Google Cloud libraries  
const { Storage } = require('@google-cloud/storage');  
const { PubSub } = require('@google-cloud/pubsub');  
const { BigQuery } = require('@google-cloud/bigquery');  
const { Compute } = require('@google-cloud/compute');  
const { CloudFunctionsServiceClient } = require('@google-cloud/functions');  
const path = require('path');  

/**   CLAUDE 3.7 Sonnet
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
  constructor(config) {  
    this.projectId = config.projectId;  
    this.keyFilename = config.keyFilename;  
    this.credentials = config.credentials;  
    
    // Initialize core services  
    this.storage = null;  
    this.pubsub = null;  
    this.bigquery = null;  
    this.computeEngine = null;  
    this.functions = null;  
    
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
  
  // ===== STORAGE METHODS =====  
  
  /**  
   * Upload a file to Google Cloud Storage  
   * @param {string} bucketName - Name of the bucket  
   * @param {string|Buffer|ReadableStream} file - File to upload  
   * @param {Object} options - Upload options  
   * @returns {Promise<Object>} - Upload response  
   */  
  async uploadFile(bucketName, file, options = {}) {  
    try {  
      const bucket = this.storage.bucket(bucketName);  
      const destination = options.destination ||   
        (typeof file === 'string' ? path.basename(file) : 'uploaded-file');  
      const blob = bucket.file(destination);  
      
      const uploadOptions = {  
        metadata: options.metadata || {},  
        contentType: options.contentType,  
        resumable: options.resumable !== false,  
        public: options.public || false  
      };  

      const [uploadResponse] = await blob.save(file, uploadOptions);  
      
      console.log(`File uploaded to ${bucketName}/${destination}`);  
      return uploadResponse;  
    } catch (error) {  
      console.error('Upload failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * Download a file from Google Cloud Storage  
   * @param {string} bucketName - Name of the bucket  
   * @param {string} fileName - Name of the file to download  
   * @param {Object} options - Download options  
   * @returns {Promise<Buffer>} - File contents  
   */  
  async downloadFile(bucketName, fileName, options = {}) {  
    try {  
      const bucket = this.storage.bucket(bucketName);  
      const file = bucket.file(fileName);  
      
      const [fileContents] = await file.download(options);  
      console.log(`File ${fileName} downloaded from ${bucketName}`);  
      
      return fileContents;  
    } catch (error) {  
      console.error('Download failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * List files in a bucket  
   * @param {string} bucketName - Name of the bucket  
   * @param {Object} options - Listing options  
   * @returns {Promise<Array>} - Array of files  
   */  
  async listFiles(bucketName, options = {}) {  
    try {  
      const bucket = this.storage.bucket(bucketName);  
      const [files] = await bucket.getFiles(options);  
      
      console.log(`Listed ${files.length} files from ${bucketName}`);  
      return files;  
    } catch (error) {  
      console.error('List files failed:', error);  
      throw error;  
    }  
  }  
  
  // ===== PUBSUB METHODS =====  
  
  /**  
   * Publish a message to a Pub/Sub topic  
   * @param {string} topicName - Name of the topic  
   * @param {Object|string} message - Message to publish  
   * @param {Object} attributes - Message attributes  
   * @returns {Promise<string>} - Message ID  
   */  
  async publishMessage(topicName, message, attributes = {}) {  
    try {  
      const topic = this.pubsub.topic(topicName);  
      const data = typeof message === 'string'   
        ? message   
        : JSON.stringify(message);  
      
      const dataBuffer = Buffer.from(data);  
      const [messageId] = await topic.publish(dataBuffer, attributes);  
      
      console.log(`Message published to ${topicName}, ID: ${messageId}`);  
      return messageId;  
    } catch (error) {  
      console.error('Publish failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * Create a subscription to a Pub/Sub topic  
   * @param {string} topicName - Name of the topic  
   * @param {string} subscriptionName - Name of the subscription  
   * @param {Object} options - Subscription options  
   * @returns {Promise<Object>} - Subscription object  
   */  
  async createSubscription(topicName, subscriptionName, options = {}) {  
    try {  
      const topic = this.pubsub.topic(topicName);  
      const [subscription] = await topic.createSubscription(subscriptionName, options);  
      
      console.log(`Subscription ${subscriptionName} created`);  
      return subscription;  
    } catch (error) {  
      console.error('Subscription creation failed:', error);  
      throw error;  
    }  
  }  
  
  // ===== BIGQUERY METHODS =====  
  
  /**  
   * Run a BigQuery SQL query  
   * @param {string} query - SQL query to execute  
   * @param {Object} options - Query options  
   * @returns {Promise<Array>} - Query results  
   */  
  async runQuery(query, options = {}) {  
    try {  
      const [rows] = await this.bigquery.query({  
        query,  
        location: options.location || 'US',  
        ...options  
      });  
      
      console.log(`Query executed, returned ${rows.length} rows`);  
      return rows;  
    } catch (error) {  
      console.error('Query failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * Create a new dataset in BigQuery  
   * @param {string} datasetId - The ID of the dataset to create  
   * @param {Object} options - Dataset creation options  
   * @returns {Promise<Object>} - The created dataset  
   */  
  async createDataset(datasetId, options = {}) {  
    try {  
      const [dataset] = await this.bigquery.createDataset(datasetId, options);  
      console.log(`Dataset ${datasetId} created`);  
      return dataset;  
    } catch (error) {  
      console.error('Dataset creation failed:', error);  
      throw error;  
    }  
  }  
  
  // ===== COMPUTE ENGINE METHODS =====  
  
  /**  
   * Create a virtual machine instance  
   * @param {string} zone - Zone for the instance  
   * @param {string} name - Name for the instance  
   * @param {Object} config - VM configuration  
   * @returns {Promise<Object>} - Operation result  
   */  
  async createVmInstance(zone, name, config) {  
    try {  
      const [operation] = await this.computeEngine.zone(zone).createVM(name, config);  
      const [vm] = await operation.promise();  
      
      console.log(`VM ${name} created in ${zone}`);  
      return vm;  
    } catch (error) {  
      console.error('VM creation failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * List all VM instances in a zone  
   * @param {string} zone - Zone to list instances from  
   * @returns {Promise<Array>} - List of VM instances  
   */  
  async listVmInstances(zone) {  
    try {  
      const [vms] = await this.computeEngine.zone(zone).getVMs();  
      console.log(`Listed ${vms.length} VMs in ${zone}`);  
      return vms;  
    } catch (error) {  
      console.error('List VMs failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * Start a VM instance  
   * @param {string} zone - Zone where the VM is located  
   * @param {string} name - Name of the VM to start  
   * @returns {Promise<Object>} - Operation result  
   */  
  async startVmInstance(zone, name) {  
    try {  
      const vm = this.computeEngine.zone(zone).vm(name);  
      const [operation] = await vm.start();  
      const [result] = await operation.promise();  
      
      console.log(`VM ${name} started in ${zone}`);  
      return result;  
    } catch (error) {  
      console.error('VM start failed:', error);  
      throw error;  
    }  
  }  
  
  /**  
   * Stop a VM instance  
   * @param {string} zone - Zone where the VM is located  
   * @param {string} name - Name of the VM to stop  
   * @returns {Promise<Object>} - Operation result  
   */  
  async stopVmInstance(zone, name) {  
    try {  
      const vm = this.computeEngine.zone(zone).vm(name);  
      const [operation] = await vm.stop();  
      const [result] = await operation.promise();  
      
      console.log(`VM ${name} stopped in ${zone}`);  
      return result;  
    } catch (error) {  
      console.error('VM stop failed:', error);  
      throw error;  
    }  
  }  
  
  // ===== CLOUD FUNCTIONS METHODS =====  
  
  /**  
   * Deploy a Cloud Function  
   * @param {string} name - Function name  
   * @param {string} runtime - Runtime (e.g., 'nodejs16')  
   * @param {string} entryPoint - Function entry point  
   * @param {string} sourceDirectory - Source code directory  
   * @param {Object} options - Additional options  
   * @returns {Promise<Object>} - Deployment result  
   */  
  async deployFunction(name, runtime, entryPoint, sourceDirectory, options = {}) {  
    try {  
      const parent = `projects/${this.projectId}/locations/${options.region || 'us-central1'}`;  
      const functionName = `${parent}/functions/${name}`;  
      
      const [operation] = await this.functions.createFunction({  
        parent,  
        function: {  
          name: functionName,  
          entryPoint,  
          runtime,  
          sourceArchiveUrl: sourceDirectory,  
          ...options  
        }  
      });  
      
      const [result] = await operation.promise();  
      console.log(`Function ${name} deployed`);  
      return result;  
    } catch (error) {  
      console.error('Function deployment failed:', error);  
      throw error;  
    }  
  }  
}  

// Export the class  
module.exports = GoogleCloudService;




// Example Usage (in another file):
// javascript
// // Import the GoogleCloudService class  
// const GoogleCloudService = require('./google-cloud-service');  

// // Initialize the service  
// const googleCloud = new GoogleCloudService({  
//   projectId: 'my-project-id',  
//   keyFilename: '/path/to/keyfile.json'  
// });  

// // Example: Upload a file to Cloud Storage  
// async function uploadExample() {  
//   try {  
//     await googleCloud.uploadFile('my-bucket', './local-file.txt', {  
//       destination: 'cloud-file.txt',  
//       contentType: 'text/plain',  
//       public: true  
//     });  
//   } catch (error) {  
//     console.error('Upload example failed:', error);  
//   }  
// }  

// // Example: Run a BigQuery query  
// async function queryExample() {  
//   try {  
//     const results = await googleCloud.runQuery(`  
//       SELECT name, count  
//       FROM \`my-project.my_dataset.my_table\`  
//       WHERE count > 100  
//       LIMIT 10  
//     `);  
    
//     console.log('Query results:', results);  
//   } catch (error) {  
//     console.error('Query example failed:', error);  
//   }  
// }  

// // Example: Publish and subscribe to Pub/Sub  
// async function pubSubExample() {  
//   try {  
//     // Create a subscription  
//     const subscription = await googleCloud.createSubscription(  
//       'my-topic',  
//       'my-subscription',  
//       { ackDeadlineSeconds: 30 }  
//     );  
    
//     // Set up message handler  
//     subscription.on('message', message => {  
//       console.log('Received message:', message.data.toString());  
//       message.ack();  
//     });  
    
//     // Publish a message  
//     await googleCloud.publishMessage('my-topic', {  
//       text: 'Hello from Google Cloud!',  
//       timestamp: new Date().toISOString()  
//     });  
//   } catch (error) {  
//     console.error('Pub/Sub example failed:', error);  
//   }  
// }  

// // Run the examples  
// uploadExample();  
// queryExample();  
// pubSubExample();  