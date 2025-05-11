import React, { useState, useEffect } from 'react';
import { fetchOperations } from '../../api/operationsapi';
import { Operation } from '../../utils/types';
import OperationChannel from './OperationChannel.tsx';
import '../authority/OperationSideBar.css';
import { FaTimes } from 'react-icons/fa';

interface OperationSideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const OperationSideBar: React.FC<OperationSideBarProps> = ({ isOpen, onClose }) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchOperations();
        setOperations(data);
        setLoading(false);
      } catch {
        setError('Failed to fetch operations');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedOperationData = operations.find((operation) => operation._id === selectedOperation);

  return (
    <div className={`operation-sidebar-container ${isOpen ? 'open' : ''}`}>
      <div className="operation-sidebar">
        <div className="sidebar-header">
          <h2>Operations</h2>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>

        {loading && <div className="loading">Loading operations...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <div className="sidebar-content">
            {selectedOperation && selectedOperationData ? (
              <OperationChannel
                operationId={selectedOperation}
                operation={selectedOperationData}
                onClose={() => setSelectedOperation(null)}
              />
            ) : (
              <ul className="operation-list">
                {operations.map((operation) => (
                  <li key={operation._id} className="operation-item">
                    <div onClick={() => setSelectedOperation(operation._id)}>
                      <h3>{operation.name}</h3>
                      <p>{operation.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationSideBar;