class CreateStanzaArchives < ActiveRecord::Migration
  def change
    create_table :stanza_archives do |t|
      t.integer :sender_id, :limit => 8
      t.integer :receiver_id, :limit => 8
      t.string :stanza_type
      t.text :stanza

      t.timestamps
    end
    add_index :stanza_archives, :sender_id
  end
end
