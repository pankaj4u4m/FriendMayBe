class CreateStanzaArchives < ActiveRecord::Migration
  def change
    create_table :stanza_archives do |t|
      t.integer :sender_id
      t.integer :receiver_id
      t.string :stanza_type
      t.text :stanza

      t.timestamps
    end
    add_index :stanza_archives, :sender_id
  end
end
