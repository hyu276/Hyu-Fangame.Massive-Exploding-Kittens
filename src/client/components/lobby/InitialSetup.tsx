import '../common/Button.css';
import '../common/Form.css';
import './LobbyStyles.css';

interface InitialSetupProps {
  name: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
}

export function InitialSetup({ name, onNameChange, onSave }: InitialSetupProps) {
  return (
    <div className="lobby-initial-setup">
      <div className="lobby-initial-setup-content">
        <h2 className="modal-title">Chào Mừng Đến Với Mèo Nổ!</h2>
        <div className="form-group">
          <label className="form-label">Nhập tên của bạn</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            placeholder="Tên của bạn..."
            autoFocus
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={onSave}
          style={{ width: '100%' }}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
