import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { X } from 'lucide-react-native';

interface DeliveryTeaserModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPickup: () => void;
}

export const DeliveryTeaserModal: React.FC<DeliveryTeaserModalProps> = ({
  visible,
  onClose,
  onSelectPickup,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.modalCloseBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={20} color="#374151" />
          </TouchableOpacity>
          
          <Text style={styles.modalIcon}>🛵</Text>
          <Text style={styles.modalTitle}>Delivery is on the way!</Text>
          <Text style={styles.modalDescription}>
            We are currently setting up our rider network. For now, please select Store Pickup to place your order.
          </Text>
          
          <TouchableOpacity
            style={styles.modalPrimaryBtn}
            onPress={onSelectPickup}
            activeOpacity={0.85}
          >
            <Text style={styles.modalPrimaryBtnText}>Order Pickup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalPrimaryBtn: {
    backgroundColor: '#3c7d48',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalPrimaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
