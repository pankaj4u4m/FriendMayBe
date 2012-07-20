class CreateRemembers < ActiveRecord::Migration
  def change
    create_table :remembers do |t|
      t.integer :rememberer_id
      t.integer :remembered_id
      t.string :status

      t.timestamps
    end
    add_index :remembers, :rememberer_id
    add_index :remembers, :remembered_id
    add_index :remembers, [:rememberer_id, :remembered_id], unique: true
  end
end
