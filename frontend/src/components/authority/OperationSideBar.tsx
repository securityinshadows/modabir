import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { fetchOperations, createOperation, deleteOperation, updateOperation } from '../../api/operationsapi';
import { Operation } from '../../utils/types';
import OperationChannel from './OperationChannel';
import './OperationSideBar.css';

interface OperationSideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const OperationSideBar: React.FC<OperationSideBarProps> = ({ isOpen, onClose }) => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [newOperationName, setNewOperationName] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false); // Toggle for edit mode
  const [updatedOperation, setUpdatedOperation] = useState<Partial<Operation>>({});
  const [newOperationDescription, setNewOperationDescription] = useState<string>('');
  const [newOperationStatus, setNewOperationStatus] = useState<'planned' | 'active' | 'completed' | 'cancelled'>('planned');
  const [showAddFields, setShowAddFields] = useState<boolean>(false); // Toggle for input fields

  React.useEffect(() => {
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

  const handleAddOperation = async () => {
    if (!newOperationName.trim() || !newOperationDescription.trim()) {
      alert('Please provide both a name and description for the operation.');
      return;
    }

    // Add "Operation" to the name if it doesn't already start with it
    const formattedName = newOperationName.toLowerCase().startsWith('operation')
      ? newOperationName
      : `Operation ${newOperationName}`;

    try {
      const newOperation = await createOperation({
        name: formattedName,
        description: newOperationDescription,
        status: newOperationStatus, // Include the selected status
        location: { type: 'Point', coordinates: [0, 0] }, // Default location
        startDate: new Date().toISOString(),
      });
      setOperations((prev) => [newOperation, ...prev]);
      setNewOperationName('');
      setNewOperationDescription('');
      setNewOperationStatus('planned'); // Reset status to default
      setShowAddFields(false); // Hide fields after adding
    } catch {
      alert('Failed to create operation.');
    }
  };

  const handleUpdateOperation = async () => {
    if (!selectedOperation) return;

    try {
      const updated = await updateOperation(selectedOperation, updatedOperation);
      setOperations((prev) =>
        prev.map((operation) => (operation._id === updated._id ? updated : operation))
      );
      setEditMode(false); // Exit edit mode
      setUpdatedOperation({});
    } catch {
      alert('Failed to update operation.');
    }
  };

  const handleDeleteOperation = async (operationId: string) => {
    if (!window.confirm('Are you sure you want to delete this operation?')) return;

    try {
      await deleteOperation(operationId);
      setOperations((prev) => prev.filter((operation) => operation._id !== operationId));
    } catch {
      alert('Failed to delete operation.');
    }
  };


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
              <>
                {editMode ? (
                  <div className="edit-operation">
                    <input
                      type="text"
                      placeholder="Operation Name"
                      defaultValue={selectedOperationData.name}
                      onChange={(e) =>
                        setUpdatedOperation((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                    <textarea
                      placeholder="Operation Description"
                      defaultValue={selectedOperationData.description}
                      onChange={(e) =>
                        setUpdatedOperation((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                    <select
                      defaultValue={selectedOperationData.status}
                      onChange={(e) =>
                        setUpdatedOperation((prev) => ({
                          ...prev,
                          status: e.target.value as 'planned' | 'active' | 'completed' | 'cancelled',
                        }))
                      }
                    >
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button onClick={handleUpdateOperation}>
                      <FaEdit /> Save Changes
                    </button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                  </div>
                ) : (
              <OperationChannel
                operationId={selectedOperation}
                operation={selectedOperationData}
                onClose={() => setSelectedOperation(null)}
              />
                )}
              </>
            ) : (
              <>
                <ul className="operation-list">
                  {operations.map((operation) => (
                    <li key={operation._id} className="operation-item">
                      <div onClick={() => setSelectedOperation(operation._id)}>
                        <h3>{operation.name}</h3>
                        <p>{operation.description}</p>
                      </div>
                      <FaEdit
                        className="edit-icon"
                        onClick={() => {
                          setSelectedOperation(operation._id);
                          setEditMode(true);
                        }}
                      />
                      <FaTrash
                        className="delete-icon"
                        onClick={() => handleDeleteOperation(operation._id)}
                      />
                    </li>
                  ))}
                </ul>

                <div className="add-operation">
                  <button
                    onClick={() => setShowAddFields((prev) => !prev)}
                    className="toggle-add-fields-button"
                  >
                    <FaPlus /> Create Operation
                  </button>

                  {showAddFields && (
                    <div className="add-operation-fields">
                      <input
                        type="text"
                        placeholder="Operation Name"
                        value={newOperationName}
                        onChange={(e) => setNewOperationName(e.target.value)}
                      />
                      <textarea
                        placeholder="Operation Description"
                        value={newOperationDescription}
                        onChange={(e) => setNewOperationDescription(e.target.value)}
                      />
                      <select
                        value={newOperationStatus}
                        onChange={(e) => setNewOperationStatus(e.target.value as 'planned' | 'active' | 'completed' | 'cancelled')}
                      >
                        <option value="planned">Planned</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button onClick={handleAddOperation}>
                        <FaPlus /> Create
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationSideBar;