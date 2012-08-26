class CreateUserConnectionStatuses < ActiveRecord::Migration
  def change
    create_table :user_connection_statuses do |t|
      t.integer :user_id, :limit => 8
      t.integer :stranger_id, :limit => 8
      t.string :user_status

      t.timestamps
    end
    add_index :user_connection_statuses, :user_id
    add_index :user_connection_statuses, :stranger_id
  end
end
