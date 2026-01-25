const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const { PubSub } = require('@google-cloud/pubsub');
require('dotenv').config(); // Load environment variables if using dotenv

//Deepseek R1
class GoogleCloud {
  constructor() {
    // Initialize clients
    this.storage = new Storage();
    this.firestore = new Firestore();
    this.pubsub = new PubSub();
  }

  // ======================
  // Google Cloud Storage
  // ======================

  /**
   * Upload a file to Google Cloud Storage
   * @param {string} bucketName - Name of the bucket
   * @param {string} filePath - Path to the file to upload
   * @param {object} metadata - Optional metadata for the file
   */
  async uploadFile(bucketName, filePath, metadata = {}) {
    try {
      await this.storage.bucket(bucketName).upload(filePath, {
        gzip: true,
        metadata: {
          cacheControl: 'public, max-age=31536000',
          ...metadata,
        },
      });
      console.log(`${filePath} uploaded to ${bucketName}.`);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }

  /**
   * Download a file from Google Cloud Storage
   * @param {string} bucketName - Name of the bucket
   * @param {string} fileName - Name of the file to download
   * @param {string} destPath - Path to save the downloaded file
   */
  async downloadFile(bucketName, fileName, destPath) {
    try {
      await this.storage.bucket(bucketName).file(fileName).download({ destination: destPath });
      console.log(`${fileName} downloaded to ${destPath}.`);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  /**
   * Delete a file from Google Cloud Storage
   * @param {string} bucketName - Name of the bucket
   * @param {string} fileName - Name of the file to delete
   */
  async deleteFile(bucketName, fileName) {
    try {
      await this.storage.bucket(bucketName).file(fileName).delete();
      console.log(`${fileName} deleted from ${bucketName}.`);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  // ======================
  // Firestore
  // ======================

  /**
   * Add a document to a Firestore collection
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - ID of the document
   * @param {object} data - Data to add to the document
   */
  async addDocument(collectionName, docId, data) {
    try {
      const docRef = this.firestore.collection(collectionName).doc(docId);
      await docRef.set(data);
      console.log(`Document ${docId} added to ${collectionName}.`);
    } catch (error) {
      console.error('Error adding document:', error);
    }
  }

  /**
   * Get a document from a Firestore collection
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - ID of the document
   * @returns {object} - Document data
   */
  async getDocument(collectionName, docId) {
    try {
      const docRef = this.firestore.collection(collectionName).doc(docId);
      const doc = await docRef.get();
      if (!doc.exists) {
        console.log(`Document ${docId} not found.`);
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  /**
   * Delete a document from a Firestore collection
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - ID of the document
   */
  async deleteDocument(collectionName, docId) {
    try {
      await this.firestore.collection(collectionName).doc(docId).delete();
      console.log(`Document ${docId} deleted from ${collectionName}.`);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }

  // ======================
  // Pub/Sub
  // ======================

  /**
   * Publish a message to a Pub/Sub topic
   * @param {string} topicName - Name of the topic
   * @param {object} data - Data to publish
   */
  async publishMessage(topicName, data) {
    try {
      const dataBuffer = Buffer.from(JSON.stringify(data));
      const messageId = await this.pubsub.topic(topicName).publish(dataBuffer);
      console.log(`Message ${messageId} published to ${topicName}.`);
    } catch (error) {
      console.error('Error publishing message:', error);
    }
  }

  /**
   * Subscribe to a Pub/Sub topic
   * @param {string} topicName - Name of the topic
   * @param {string} subscriptionName - Name of the subscription
   * @param {function} callback - Callback function to handle messages
   */
  async subscribeToTopic(topicName, subscriptionName, callback) {
    try {
      const topic = this.pubsub.topic(topicName);
      const subscription = topic.subscription(subscriptionName);

      subscription.on('message', callback);
      console.log(`Subscribed to ${subscriptionName}.`);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  }
}

// ======================
// Example Usage
// ======================

(async () => {
  const googleCloud = new GoogleCloud();

  // Google Cloud Storage Examples
  await googleCloud.uploadFile('your-bucket-name', 'path/to/your/file.txt');
  await googleCloud.downloadFile('your-bucket-name', 'file.txt', 'path/to/save/file.txt');
  await googleCloud.deleteFile('your-bucket-name', 'file.txt');

  // Firestore Examples
  await googleCloud.addDocument('your-collection', 'your-doc-id', { name: 'John Doe', age: 30 });
  const document = await googleCloud.getDocument('your-collection', 'your-doc-id');
  console.log('Retrieved document:', document);
  await googleCloud.deleteDocument('your-collection', 'your-doc-id');

  // Pub/Sub Examples
  await googleCloud.publishMessage('your-topic-name', { message: 'Hello, Pub/Sub!' });
  await googleCloud.subscribeToTopic('your-topic-name', 'your-subscription-name', (message) => {
    console.log('Received message:', message.data.toString());
    message.ack();
  });
})();