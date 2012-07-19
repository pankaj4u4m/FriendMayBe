class CreateRemembers < ActiveRecord::Migration
  def change
    create_table :remembers do |t|
      t.integer :user_id_by
      t.integer :user_id_to
      t.string :status

      t.timestamps
    end
    add_index :remembers, :user_id_by
    add_index :remembers, :user_id_to
  end
end
